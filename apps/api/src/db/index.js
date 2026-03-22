import { getDefaultBusinessSeed } from '../config/env.js';
import { db } from './client.js';
import { createAccessRequestsRepository } from './repositories/access-requests-repository.js';
import { createBookingsRepository } from './repositories/bookings-repository.js';
import { createBusinessesRepository } from './repositories/businesses-repository.js';
import { createContactsRepository } from './repositories/contacts-repository.js';
import { createConversationsRepository } from './repositories/conversations-repository.js';
import { createCustomersRepository } from './repositories/customers-repository.js';
import { createMessagesRepository } from './repositories/messages-repository.js';
import { createSubscriptionsRepository } from './repositories/subscriptions-repository.js';

export function createRepositories() {
  return {
    businesses: createBusinessesRepository(db),
    contacts: createContactsRepository(db),
    conversations: createConversationsRepository(db),
    messages: createMessagesRepository(db),
    bookings: createBookingsRepository(db),
    accessRequests: createAccessRequestsRepository(db),
    customers: createCustomersRepository(db),
    subscriptions: createSubscriptionsRepository(db)
  };
}

export async function bootstrapDatabase(repositories) {
  return repositories.businesses.ensureBusiness(getDefaultBusinessSeed());
}
