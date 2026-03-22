import { getDefaultBusinessSeed } from '../config/env.js';
import { db } from './client.js';
import { createAccessRequestsRepository } from './repositories/access-requests-repository.js';
import { createBookingsRepository } from './repositories/bookings-repository.js';
import { createBusinessesRepository } from './repositories/businesses-repository.js';
import { createContactsRepository } from './repositories/contacts-repository.js';
import { createConversationsRepository } from './repositories/conversations-repository.js';
import { createLeadsRepository } from './repositories/leads-repository.js';
import { createMessagesRepository } from './repositories/messages-repository.js';
import { createReviewRequestsRepository } from './repositories/review-requests-repository.js';

export function createRepositories() {
  const accessRequests = createAccessRequestsRepository(db);

  return {
    accessRequests,
    businesses: createBusinessesRepository(db),
    contacts: createContactsRepository(db),
    conversations: createConversationsRepository(db),
    messages: createMessagesRepository(db),
    bookings: createBookingsRepository(db),
    leads: createLeadsRepository(db),
    reviewRequests: createReviewRequestsRepository(db),
    waitlist: accessRequests
  };
}

export function bootstrapDatabase(repositories) {
  return repositories.businesses.ensureBusiness(getDefaultBusinessSeed());
}
