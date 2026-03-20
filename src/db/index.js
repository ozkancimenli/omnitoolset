import { env } from '../config/env.js';
import { db } from './client.js';
import { createBookingsRepository } from './repositories/bookings-repository.js';
import { createBusinessesRepository } from './repositories/businesses-repository.js';
import { createConversationsRepository } from './repositories/conversations-repository.js';
import { createLeadsRepository } from './repositories/leads-repository.js';
import { createMessagesRepository } from './repositories/messages-repository.js';
import { createReviewsRepository } from './repositories/reviews-repository.js';
import { createWaitlistRepository } from './repositories/waitlist-repository.js';

export function createRepositories() {
  return {
    businesses: createBusinessesRepository(db),
    conversations: createConversationsRepository(db),
    messages: createMessagesRepository(db),
    bookings: createBookingsRepository(db),
    leads: createLeadsRepository(db),
    reviews: createReviewsRepository(db),
    waitlist: createWaitlistRepository(db)
  };
}

export function bootstrapDatabase(repositories) {
  return repositories.businesses.ensureBusiness({
    name: env.defaultBusiness.name,
    slug: env.defaultBusiness.slug,
    twilioPhone: env.defaultBusiness.twilioPhone,
    timezone: env.defaultBusiness.timezone,
    forwardingPhone: env.defaultBusiness.forwardingPhone,
    servicesSummary: env.defaultBusiness.servicesSummary,
    hoursSummary: env.defaultBusiness.hoursSummary,
    bookingDurationMinutes: env.defaultBusiness.bookingDurationMinutes,
    bookingWindowDays: env.defaultBusiness.bookingWindowDays
  });
}
