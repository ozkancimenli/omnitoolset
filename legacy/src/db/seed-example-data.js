import { DateTime } from 'luxon';

import { db } from './client.js';
import { bootstrapDatabase, createRepositories } from './index.js';

const repositories = createRepositories();
const business = bootstrapDatabase(repositories);

const contact = repositories.contacts.findOrCreate({
  businessId: business.id,
  name: 'Alex Morgan',
  phone: '+15550000001',
  email: 'alex@example.com',
  source: 'example-seed'
});

const conversation = repositories.conversations.findOrCreate({
  businessId: business.id,
  contactId: contact.id,
  channel: 'sms'
});

repositories.messages.create({
  businessId: business.id,
  conversationId: conversation.id,
  direction: 'inbound',
  channel: 'sms',
  body: 'Hi, do you have anything tomorrow afternoon?',
  providerSid: null,
  fromPhone: contact.phone,
  toPhone: business.twilio_phone,
  metadata: {
    source: 'example-seed'
  }
});

repositories.messages.create({
  businessId: business.id,
  conversationId: conversation.id,
  direction: 'outbound',
  channel: 'sms',
  body: 'We can do tomorrow at 2:00 PM or 3:30 PM. Which works better for you?',
  providerSid: null,
  fromPhone: business.twilio_phone,
  toPhone: contact.phone,
  metadata: {
    source: 'example-seed',
    workflow: 'offer_slots'
  }
});

repositories.conversations.saveState({
  id: conversation.id,
  status: 'open',
  currentStage: 'awaiting_confirmation',
  metadata: {
    offeredSlots: [
      DateTime.utc().plus({ days: 1, hours: 14 }).toISO(),
      DateTime.utc().plus({ days: 1, hours: 15, minutes: 30 }).toISO()
    ]
  },
  lastInboundAt: DateTime.utc().minus({ minutes: 5 }).toISO(),
  lastOutboundAt: DateTime.utc().toISO()
});

const booking = repositories.bookings.saveForConversation({
  businessId: business.id,
  conversationId: conversation.id,
  contactId: contact.id,
  requestedSlot: DateTime.utc().plus({ days: 1, hours: 14 }).toISO(),
  status: 'pending',
  notes: 'Example seed booking'
});

repositories.leads.create({
  businessId: business.id,
  contactId: contact.id,
  source: 'website',
  campaign: 'spring-launch',
  status: 'new',
  notes: 'Example lead ready for lead capture module'
});

repositories.reviewRequests.create({
  businessId: business.id,
  contactId: contact.id,
  conversationId: conversation.id,
  bookingId: booking.id,
  channel: 'sms',
  destination: contact.phone,
  status: 'queued',
  requestedAt: null,
  notes: 'Example review request for scaffold module'
});

console.log(`Seeded example data for ${business.name}.`);
db.close();
