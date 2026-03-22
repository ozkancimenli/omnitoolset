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
    reason
  });

  res.status(403).type('text/plain').send('Forbidden');
}

export function createSmsAssistantRouter({ service }) {
  const router = Router();

  router.get('/status', (_req, res) => {
    const overview = service.getModuleOverview();
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
      ]
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

      const result = await service.handleIncomingSms(validation.sanitized);

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

  router.post('/webhooks/sms', async (req, res) => {
    res.type('text/xml');
    if (!isFormWebhookRequest(req)) {
      logger.warn('security.twilio_invalid_content_type', {
        requestId: req.requestId,
        path: req.path,
        contentType: req.get('content-type') || ''
      });
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
      logger.warn('sms_assistant.invalid_sms_payload', {
        requestId: req.requestId,
        fieldErrors: validation.fieldErrors,
        from: maskPhoneNumber(payload.from),
        messageSid: maskIdentifier(payload.messageSid)
      });
      res.send(createEmptyMessagingTwiml());
      return;
    }

    try {
      const result = await service.handleIncomingSms(validation.sanitized);
      if (result.duplicate) {
        res.send(createEmptyMessagingTwiml());
        return;
      }

      res.send(createMessagingTwiml(result.replyText));
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
      logger.warn('security.twilio_invalid_content_type', {
        requestId: req.requestId,
        path: req.path,
        contentType: req.get('content-type') || ''
      });
      res.status(415).send(createIncomingVoiceTwiml({ actionUrl: null, forwardingPhone: null, callerId: null }));
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
      logger.warn('sms_assistant.invalid_voice_payload', {
        requestId: req.requestId,
        fieldErrors: validation.fieldErrors
      });
      res.send(
        createIncomingVoiceTwiml({
          actionUrl: null,
          forwardingPhone: null,
          callerId: null
        })
      );
      return;
    }

    try {
      const sanitized = validation.sanitized;
      const trafficDecision = service.evaluateInboundTraffic({
        business: null,
        from: sanitized.from,
        to: sanitized.to,
        channel: 'voice',
        providerSid: sanitized.callSid,
        eventType: 'voice-incoming'
      });

      if (!trafficDecision.allowed) {
        logger.warn('security.voice_incoming_blocked', {
          requestId: req.requestId,
          reason: trafficDecision.reason,
          from: maskPhoneNumber(sanitized.from),
          to: maskPhoneNumber(sanitized.to),
          callSid: maskIdentifier(sanitized.callSid)
        });
        res.send(
          createIncomingVoiceTwiml({
            actionUrl: null,
            forwardingPhone: null,
            callerId: null
          })
        );
        return;
      }

      const routing = service.getVoiceRouting(sanitized.to);

      if (!routing.forwardingPhone) {
        await service.handleMissedCall({
          from: sanitized.from,
          to: sanitized.to,
          callSid: sanitized.callSid,
          callStatus: 'no-answer'
        });
      }

      res.send(
        createIncomingVoiceTwiml({
          actionUrl: buildAbsoluteUrlFromRequest(req, '/api/sms-assistant/webhooks/voice/dial-result'),
          forwardingPhone: routing.forwardingPhone,
          callerId: routing.callerId
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
      res.send(
        createIncomingVoiceTwiml({
          actionUrl: null,
          forwardingPhone: null,
          callerId: null
        })
      );
    }
  });

  router.post('/webhooks/voice/dial-result', async (req, res) => {
    res.type('text/xml');
    if (!isFormWebhookRequest(req)) {
      logger.warn('security.twilio_invalid_content_type', {
        requestId: req.requestId,
        path: req.path,
        contentType: req.get('content-type') || ''
      });
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
      logger.warn('sms_assistant.invalid_dial_result_payload', {
        requestId: req.requestId,
        fieldErrors: validation.fieldErrors
      });
      res.send(createDialResultTwiml({ missed: true }));
      return;
    }

    try {
      const result = await service.handleMissedCall(validation.sanitized);
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
