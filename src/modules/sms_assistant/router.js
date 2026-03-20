import { Router } from 'express';

import { asyncHandler } from '../../core/http/async-handler.js';
import { buildAbsoluteUrl } from '../../integrations/twilio/client.js';
import {
  createDialResultTwiml,
  createEmptyMessagingTwiml,
  createIncomingVoiceTwiml,
  createMessagingTwiml
} from '../../integrations/twilio/twiml.js';

export function createSmsAssistantRouter({ service }) {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json(service.getModuleOverview());
  });

  router.post(
    '/simulate',
    asyncHandler(async (req, res) => {
      const result = await service.handleIncomingSms({
        from: req.body.from,
        to: req.body.to,
        body: req.body.body,
        messageSid: req.body.messageSid || `simulated:${Date.now()}`,
        customerName: req.body.customerName || null
      });

      res.json({
        ok: true,
        duplicate: result.duplicate,
        replyText: result.replyText,
        planType: result.plan?.type,
        bookingStatus: result.booking?.status || null
      });
    })
  );

  router.post(
    '/webhooks/sms',
    asyncHandler(async (req, res) => {
      const result = await service.handleIncomingSms({
        from: req.body.From,
        to: req.body.To,
        body: req.body.Body,
        messageSid: req.body.MessageSid,
        customerName: req.body.ProfileName || null
      });

      res.type('text/xml');

      if (result.duplicate) {
        res.send(createEmptyMessagingTwiml());
        return;
      }

      res.send(createMessagingTwiml(result.replyText));
    })
  );

  router.post(
    '/webhooks/voice/incoming',
    asyncHandler(async (req, res) => {
      const routing = service.getVoiceRouting(req.body.To);

      if (!routing.forwardingPhone) {
        await service.handleMissedCall({
          from: req.body.From,
          to: req.body.To,
          callSid: req.body.CallSid || `call:${Date.now()}`,
          callStatus: 'no-answer'
        });
      }

      res.type('text/xml');
      res.send(
        createIncomingVoiceTwiml({
          actionUrl: buildAbsoluteUrl('/api/sms-assistant/webhooks/voice/dial-result'),
          forwardingPhone: routing.forwardingPhone,
          callerId: routing.callerId
        })
      );
    })
  );

  router.post(
    '/webhooks/voice/dial-result',
    asyncHandler(async (req, res) => {
      const result = await service.handleMissedCall({
        from: req.body.From,
        to: req.body.To,
        callSid: req.body.CallSid || req.body.DialCallSid || `call:${Date.now()}`,
        callStatus: req.body.DialCallStatus || req.body.CallStatus
      });

      res.type('text/xml');
      res.send(createDialResultTwiml({ missed: !result.skipped }));
    })
  );

  return router;
}
