import { Router } from 'express';

import { asyncHandler } from '../../core/http/async-handler.js';
import { logger, maskIdentifier, maskPhoneNumber } from '../../core/logging/logger.js';
import {
  buildAbsoluteUrlFromRequest,
  validateTwilioWebhookRequest
} from '../../integrations/twilio/client.js';
import {
  createDialResultTwiml,
  createEmptyMessagingTwiml,
  createIncomingVoiceTwiml,
  createMessagingTwiml
} from '../../integrations/twilio/twiml.js';
import {
  parseDialResultPayload,
  parseInboundSmsPayload,
  parseIncomingCallPayload
} from './webhook-parsers.js';
import {
  validateDialResultPayload,
  validateInboundSmsPayload,
  validateIncomingCallPayload
} from './security.js';

const SAFE_SMS_REPLY = 'Thanks for reaching out. We got your message and will follow up shortly.';

function isFormWebhookRequest(req) {
  return Boolean(req.is('application/x-www-form-urlencoded'));
}

function rejectInvalidTwilioRequest(req, res, reason) {
  logger.warn('security.twilio_webhook_rejected', {
    requestId: req.requestId,
    path: req.path,
    reason,
    method: req.method,
    host: req.get('host') || null,
    contentType: req.get('content-type') || null,
    hasSignature: Boolean(req.get('x-twilio-signature'))
  });

  res.status(403).type('text/plain').send('Forbidden');
}

export function createSmsAssistantRouter({ service, billingService }) {
  const router = Router();

  router.get('/status', async (_req, res) => {
    const overview = service.getModuleOverview();
    const diagnostics = await service.getRuntimeDiagnostics();

    res.json({
      product: overview.product,
      status: overview.status,
      implemented: true,
      liveFeatures: [
        'Incoming SMS webhook handling',
        'OpenAI-generated SMS replies',
        'Booking slot suggestions',
        'Missed call auto-SMS flow',
        'Conversation and booking persistence'
      ],
      diagnostics: {
        hasOpenAI: diagnostics.hasOpenAI,
        hasTwilio: diagnostics.hasTwilio,
        signatureValidationEnabled: diagnostics.signatureValidationEnabled,
        configuredTwilioPhone: maskPhoneNumber(diagnostics.configuredTwilioPhone),
        activeBusinessMapped: diagnostics.activeBusinessMapped,
        mappedBusinessStatus: diagnostics.mappedBusinessStatus,
        automationEnabled: diagnostics.automationEnabled,
        onboardingCompleted: diagnostics.onboardingCompleted,
        forwardingConfigured: diagnostics.forwardingConfigured
      }
    });
  });

  router.post(
    '/simulate',
    asyncHandler(async (req, res) => {
      const payload = parseInboundSmsPayload(req.body, { allowSyntheticSid: true });
      const validation = validateInboundSmsPayload(payload, { allowSyntheticSid: true });

      if (!validation.ok) {
        res.status(400).json({
          ok: false,
          error: 'Invalid SMS payload.',
          fieldErrors: validation.fieldErrors
        });
        return;
      }

      const result = await service.handleIncomingSms(validation.sanitized, {
        allowFallbackBusiness: true
      });

      res.json({
        ok: true,
        duplicate: result.duplicate,
        blocked: result.blocked || false,
        replyText: result.replyText,
        planType: result.plan?.type,
        bookingStatus: result.booking?.status || null
      });
    })
  );

  router.get(
    '/onboarding/session',
    asyncHandler(async (req, res) => {
      if (!billingService) {
        res.status(503).json({
          ok: false,
          error: 'Billing onboarding is not configured.'
        });
        return;
      }

      try {
        const context = await billingService.getSmsOnboardingContext({
          sessionId: req.query.session_id
        });

        res.json({
          ok: true,
          ...context
        });
      } catch (error) {
        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.message,
          fieldErrors: error.fieldErrors || null
        });
      }
    })
  );

  router.post(
    '/onboarding',
    asyncHandler(async (req, res) => {
      if (!billingService) {
        res.status(503).json({
          ok: false,
          error: 'Billing onboarding is not configured.'
        });
        return;
      }

      try {
        const result = await billingService.submitSmsOnboarding(req.body);

        res.json({
          ok: true,
          businessId: result.business.id,
          status: result.business.status
        });
      } catch (error) {
        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.message,
          fieldErrors: error.fieldErrors || null
        });
      }
    })
  );

  router.get(
    '/settings',
    asyncHandler(async (req, res) => {
      if (!billingService) {
        res.status(503).json({
          ok: false,
          error: 'Billing-backed settings are not configured.'
        });
        return;
      }

      try {
        const context = await billingService.getSmsSettingsContext({
          sessionId: req.query.session_id
        });

        res.json({
          ok: true,
          ...context
        });
      } catch (error) {
        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.message,
          fieldErrors: error.fieldErrors || null
        });
      }
    })
  );

  router.post(
    '/settings',
    asyncHandler(async (req, res) => {
      if (!billingService) {
        res.status(503).json({
          ok: false,
          error: 'Billing-backed settings are not configured.'
        });
        return;
      }

      try {
        const result = await billingService.updateSmsSettings(req.body);

        res.json({
          ok: true,
          sessionId: result.sessionId,
          business: result.business
        });
      } catch (error) {
        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.message,
          fieldErrors: error.fieldErrors || null
        });
      }
    })
  );

  router.post('/webhooks/sms', async (req, res) => {
    res.type('text/xml');

    logger.info('sms_assistant.sms_webhook_received', {
      requestId: req.requestId,
      host: req.get('host') || null,
      contentType: req.get('content-type') || null,
      hasSignature: Boolean(req.get('x-twilio-signature'))
    });

    if (!isFormWebhookRequest(req)) {
      res.status(415).send(createEmptyMessagingTwiml());
      return;
    }

    const signature = validateTwilioWebhookRequest(req);
    if (!signature.valid) {
      rejectInvalidTwilioRequest(req, res, signature.reason);
      return;
    }

    const payload = parseInboundSmsPayload(req.body);
    const validation = validateInboundSmsPayload(payload);

    if (!validation.ok) {
      res.send(createEmptyMessagingTwiml());
      return;
    }

    try {
      const result = await service.handleIncomingSms(validation.sanitized, {
        allowFallbackBusiness: false
      });
      res.send(
        result.duplicate || !result.replyText
          ? createEmptyMessagingTwiml()
          : createMessagingTwiml(result.replyText)
      );
    } catch (error) {
      logger.error('sms_assistant.sms_webhook_failed', {
        requestId: req.requestId,
        from: maskPhoneNumber(validation.sanitized.from),
        to: maskPhoneNumber(validation.sanitized.to),
        messageSid: maskIdentifier(validation.sanitized.messageSid),
        error: error.message
      });
      res.send(createMessagingTwiml(SAFE_SMS_REPLY));
    }
  });

  router.post('/webhooks/voice/incoming', async (req, res) => {
    res.type('text/xml');

    if (!isFormWebhookRequest(req)) {
      res.status(415).send(createDialResultTwiml({ missed: false }));
      return;
    }

    const signature = validateTwilioWebhookRequest(req);
    if (!signature.valid) {
      rejectInvalidTwilioRequest(req, res, signature.reason);
      return;
    }

    const payload = parseIncomingCallPayload(req.body);
    const validation = validateIncomingCallPayload(payload);

    if (!validation.ok) {
      res.send(createDialResultTwiml({ missed: false }));
      return;
    }

    try {
      const sanitized = validation.sanitized;
      const trafficDecision = await service.evaluateInboundTraffic({
        business: null,
        from: sanitized.from,
        to: sanitized.to,
        channel: 'voice',
        providerSid: sanitized.callSid,
        eventType: 'voice-incoming',
        allowFallbackBusiness: false
      });

      if (!trafficDecision.allowed) {
        res.send(createDialResultTwiml({ missed: false }));
        return;
      }

      const routing = await service.getVoiceRouting(sanitized.to, {
        allowFallbackBusiness: false
      });

      if (!routing.active) {
        res.send(createDialResultTwiml({ missed: false }));
        return;
      }

      if (!routing.forwardingPhone) {
        await service.handleMissedCall({
          from: sanitized.from,
          to: sanitized.to,
          callSid: sanitized.callSid,
          callStatus: 'no-answer'
        }, {
          allowFallbackBusiness: false
        });
      }

      res.send(
        createIncomingVoiceTwiml({
          actionUrl: buildAbsoluteUrlFromRequest(req, '/api/sms-assistant/webhooks/voice/dial-result'),
          forwardingPhone: routing.forwardingPhone,
          callerId: routing.callerId,
          automationEnabled: routing.automationEnabled
        })
      );
    } catch (error) {
      logger.error('sms_assistant.voice_incoming_webhook_failed', {
        requestId: req.requestId,
        from: maskPhoneNumber(validation.sanitized.from),
        to: maskPhoneNumber(validation.sanitized.to),
        callSid: maskIdentifier(validation.sanitized.callSid),
        error: error.message
      });
      res.send(createDialResultTwiml({ missed: false }));
    }
  });

  router.post('/webhooks/voice/dial-result', async (req, res) => {
    res.type('text/xml');

    if (!isFormWebhookRequest(req)) {
      res.status(415).send(createDialResultTwiml({ missed: false }));
      return;
    }

    const signature = validateTwilioWebhookRequest(req);
    if (!signature.valid) {
      rejectInvalidTwilioRequest(req, res, signature.reason);
      return;
    }

    const payload = parseDialResultPayload(req.body);
    const validation = validateDialResultPayload(payload);

    if (!validation.ok) {
      res.send(createDialResultTwiml({ missed: true }));
      return;
    }

    try {
      const result = await service.handleMissedCall(validation.sanitized, {
        allowFallbackBusiness: false
      });
      res.send(createDialResultTwiml({ missed: !result.skipped }));
    } catch (error) {
      logger.error('sms_assistant.dial_result_webhook_failed', {
        requestId: req.requestId,
        from: maskPhoneNumber(validation.sanitized.from),
        to: maskPhoneNumber(validation.sanitized.to),
        callSid: maskIdentifier(validation.sanitized.callSid),
        callStatus: validation.sanitized.callStatus,
        error: error.message
      });
      res.send(createDialResultTwiml({ missed: true }));
    }
  });

  return router;
}
