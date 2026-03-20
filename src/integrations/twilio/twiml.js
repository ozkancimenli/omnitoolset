import twilio from 'twilio';

export function createMessagingTwiml(message) {
  const response = new twilio.twiml.MessagingResponse();
  response.message(message);
  return response.toString();
}

export function createEmptyMessagingTwiml() {
  const response = new twilio.twiml.MessagingResponse();
  return response.toString();
}

export function createIncomingVoiceTwiml({ actionUrl, forwardingPhone, callerId }) {
  const response = new twilio.twiml.VoiceResponse();

  if (forwardingPhone) {
    response.say('Please hold while we connect you.');
    const dial = response.dial({
      action: actionUrl,
      method: 'POST',
      timeout: 20,
      callerId
    });
    dial.number(forwardingPhone);
  } else {
    response.say('Thanks for calling. We will text you shortly.');
  }

  response.hangup();
  return response.toString();
}

export function createDialResultTwiml({ missed }) {
  const response = new twilio.twiml.VoiceResponse();

  if (missed) {
    response.say('Sorry we missed your call. We will text you shortly.');
  } else {
    response.say('Thanks for calling.');
  }

  response.hangup();
  return response.toString();
}
