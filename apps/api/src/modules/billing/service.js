import { getProductByModuleId } from '@omnitoolset/shared/products';

import { env } from '../../config/env.js';
import { normalizePhoneNumber } from '../sms_assistant/security.js';

function normalizeText(value, maxLength = 160) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 160).toLowerCase();
}

function slugify(value) {
  return normalizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function toIsoFromUnix(value) {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
}

function validateSessionId(value) {
  return normalizeText(value, 120);
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
}

function getAssignedTwilioPhone() {
  return env.twilio.phoneNumber || env.defaultBusiness.twilioPhone || '';
}

function validateCheckoutInput(payload = {}) {
  const product = getProductByModuleId('sms_assistant');
  const name = normalizeText(payload.name, 120);
  const email = normalizeEmail(payload.email);
  const companyName = normalizeText(payload.companyName, 160);
  const fieldErrors = {};

  if (!name) {
    fieldErrors.name = 'Please enter your name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!companyName) {
    fieldErrors.companyName = 'Please enter your business name.';
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    product,
    name,
    email,
    companyName,
    fieldErrors
  };
}

export class BillingValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'BillingValidationError';
    this.statusCode = 400;
    this.fieldErrors = fieldErrors;
  }
}

export function createBillingService({ repositories, stripe }) {
  async function requireStripe() {
    if (!stripe || !env.stripe.secretKey || !env.stripe.priceId) {
      const error = new Error('Stripe billing is not configured.');
      error.statusCode = 503;
      throw error;
    }
  }

  async function findOrCreateStripeCustomer({ name, email, companyName }) {
    await requireStripe();

    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    });

    const basePayload = {
      email,
      name,
      metadata: {
        company_name: companyName,
        platform: 'omnitoolset',
        product_module: 'sms_assistant'
      }
    };

    const existing = existingCustomers.data[0];

    if (existing && !existing.deleted) {
      return stripe.customers.update(existing.id, basePayload);
    }

    return stripe.customers.create(basePayload);
  }

  async function generateUniqueBusinessSlug(companyName) {
    const base = slugify(companyName) || 'business';
    let candidate = base;
    let counter = 2;

    while (await repositories.businesses.getBySlug(candidate)) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }

    return candidate;
  }

  async function ensureCustomerAndBusiness({
    stripeCustomerId,
    fallbackEmail = null,
    fallbackName = null,
    fallbackCompanyName = null,
    source = 'stripe-webhook',
    businessStatus = 'pending_onboarding'
  }) {
    await requireStripe();

    const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);

    if (stripeCustomer.deleted) {
      throw new Error('Stripe customer is deleted.');
    }

    const customer = await repositories.customers.upsertStripeCustomer({
      stripeCustomerId,
      email: stripeCustomer.email || fallbackEmail,
      name: stripeCustomer.name || fallbackName,
      companyName: stripeCustomer.metadata?.company_name || fallbackCompanyName,
      status: 'active',
      metadata: {
        source
      }
    });

    let business = await repositories.businesses.findByOwnerCustomerId(customer.id);

    if (!business) {
      const businessName = customer.companyName || customer.name || 'New Business';
      const slug = await generateUniqueBusinessSlug(businessName);

      business = await repositories.businesses.createOwnedBusiness({
        name: businessName,
        slug,
        ownerCustomerId: customer.id,
        ownerName: customer.name || null,
        contactEmail: customer.email || null,
        contactPhone: null,
        timezone: env.defaultBusiness.timezone,
        forwardingPhone: '',
        businessType: env.defaultBusiness.businessType,
        servicesSummary: env.defaultBusiness.servicesSummary,
        hoursSummary: env.defaultBusiness.hoursSummary,
        priceSummary: env.defaultBusiness.priceSummary,
        status: businessStatus,
        bookingDurationMinutes: env.defaultBusiness.bookingDurationMinutes,
        bookingWindowDays: env.defaultBusiness.bookingWindowDays
      });
    }

    return {
      customer,
      business,
      stripeCustomer
    };
  }

  async function upsertSubscriptionFromStripe({
    stripeSubscriptionId,
    stripeCustomerId,
    stripeCheckoutSessionId = null,
    fallbackEmail = null,
    fallbackName = null,
    fallbackCompanyName = null
  }) {
    await requireStripe();

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const account = await ensureCustomerAndBusiness({
      stripeCustomerId,
      fallbackEmail,
      fallbackName,
      fallbackCompanyName,
      source: 'stripe-subscription'
    });

    return repositories.subscriptions.upsertStripeSubscription({
      customerId: account.customer.id,
      businessId: account.business.id,
      productModule: 'sms_assistant',
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCheckoutSessionId,
      stripePriceId: subscription.items.data[0]?.price?.id || env.stripe.priceId,
      status: subscription.status,
      currentPeriodStart: toIsoFromUnix(subscription.items.data[0]?.current_period_start || subscription.current_period_start),
      currentPeriodEnd: toIsoFromUnix(subscription.items.data[0]?.current_period_end || subscription.current_period_end),
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
      metadata: {
        source: 'stripe-subscription',
        collectionMethod: subscription.collection_method || null
      }
    });
  }

  async function getCheckoutSessionContext(sessionId) {
    await requireStripe();

    const normalizedSessionId = validateSessionId(sessionId);

    if (!normalizedSessionId) {
      throw new BillingValidationError('A valid Stripe session ID is required.', {
        sessionId: 'Missing checkout session.'
      });
    }

    const session = await stripe.checkout.sessions.retrieve(normalizedSessionId);

    if (!session || session.mode !== 'subscription' || !session.customer) {
      throw new BillingValidationError('Invalid checkout session.', {
        sessionId: 'This checkout session could not be used for onboarding.'
      });
    }

    const account = await ensureCustomerAndBusiness({
      stripeCustomerId: session.customer,
      fallbackEmail: session.customer_details?.email || null,
      fallbackName: session.customer_details?.name || session.metadata?.contact_name || null,
      fallbackCompanyName: session.metadata?.company_name || null,
      source: 'sms-onboarding-context',
      businessStatus: 'pending_onboarding'
    });

    if (session.subscription) {
      await upsertSubscriptionFromStripe({
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        stripeCheckoutSessionId: session.id,
        fallbackEmail: session.customer_details?.email || null,
        fallbackName: session.customer_details?.name || session.metadata?.contact_name || null,
        fallbackCompanyName: session.metadata?.company_name || null
      });
    }

    return {
      sessionId: session.id,
      stripeCustomerId: session.customer,
      customer: account.customer,
      business: account.business
    };
  }

  function validateOnboardingInput(payload = {}) {
    const sessionId = validateSessionId(payload.sessionId);
    const businessName = normalizeText(payload.businessName, 160);
    const ownerName = normalizeText(payload.ownerName, 120);
    const email = normalizeEmail(payload.email);
    const phoneNumber = normalizePhoneNumber(payload.phoneNumber);
    const businessType = normalizeText(payload.businessType, 120);
    const workingHours = normalizeText(payload.workingHours, 240);
    const pricingInfo = normalizeText(payload.pricingInfo || '', 240);
    const fieldErrors = {};

    if (!sessionId) {
      fieldErrors.sessionId = 'Missing checkout session.';
    }

    if (!businessName) {
      fieldErrors.businessName = 'Please enter your business name.';
    }

    if (!ownerName) {
      fieldErrors.ownerName = 'Please enter the owner name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Please enter a valid email address.';
    }

    if (!phoneNumber) {
      fieldErrors.phoneNumber = 'Please enter a valid phone number in international format.';
    }

    if (!businessType) {
      fieldErrors.businessType = 'Please enter your business type.';
    }

    if (!workingHours) {
      fieldErrors.workingHours = 'Please enter your working hours.';
    }

    return {
      ok: Object.keys(fieldErrors).length === 0,
      sessionId,
      businessName,
      ownerName,
      email,
      phoneNumber,
      businessType,
      workingHours,
      pricingInfo: pricingInfo || null,
      fieldErrors
    };
  }

  function validateSettingsInput(payload = {}) {
    const sessionId = validateSessionId(payload.sessionId);
    const workingHours = normalizeText(payload.workingHours, 240);
    const pricingInfo = normalizeText(payload.pricingInfo || '', 240);
    const automationEnabled = normalizeBoolean(payload.automationEnabled);
    const fieldErrors = {};

    if (!sessionId) {
      fieldErrors.sessionId = 'Missing checkout session.';
    }

    if (!workingHours) {
      fieldErrors.workingHours = 'Please enter your working hours.';
    }

    if (automationEnabled === null) {
      fieldErrors.automationEnabled = 'Please choose whether automation should stay enabled.';
    }

    return {
      ok: Object.keys(fieldErrors).length === 0,
      sessionId,
      workingHours,
      pricingInfo: pricingInfo || null,
      automationEnabled,
      fieldErrors
    };
  }

  return {
    async createCheckoutSession(payload) {
      const validation = validateCheckoutInput(payload);

      if (!validation.ok) {
        throw new BillingValidationError('Please correct the form errors.', validation.fieldErrors);
      }

      await requireStripe();

      const stripeCustomer = await findOrCreateStripeCustomer({
        name: validation.name,
        email: validation.email,
        companyName: validation.companyName
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: stripeCustomer.id,
        line_items: [
          {
            price: env.stripe.priceId,
            quantity: 1
          }
        ],
        success_url: `${env.frontendAppUrl}/sms/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.frontendAppUrl}/sms?checkout=cancel`,
        metadata: {
          contact_name: validation.name,
          company_name: validation.companyName,
          product_module: 'sms_assistant'
        },
        subscription_data: {
          metadata: {
            contact_name: validation.name,
            company_name: validation.companyName,
            product_module: 'sms_assistant'
          }
        }
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url
      };
    },

    async getSmsOnboardingContext(payload) {
      const context = await getCheckoutSessionContext(payload.sessionId);

      return {
        sessionId: context.sessionId,
        stripeCustomerId: context.stripeCustomerId,
        business: {
          name: context.business.name || '',
          ownerName: context.business.ownerName || context.customer.name || '',
          email: context.business.contactEmail || context.customer.email || '',
          phoneNumber: context.business.contactPhone || '',
          businessType: context.business.businessType || '',
          workingHours: context.business.hoursSummary || '',
          pricingInfo: context.business.priceSummary || '',
          status: context.business.status || 'pending_onboarding',
          onboardingCompletedAt: context.business.onboardingCompletedAt || null
        }
      };
    },

    async getSmsSettingsContext(payload) {
      const context = await getCheckoutSessionContext(payload.sessionId);
      const recentConversations = await repositories.conversations.listRecentByBusiness(
        context.business.id,
        10
      );

      return {
        sessionId: context.sessionId,
        business: {
          id: context.business.id,
          name: context.business.name || '',
          phoneNumber: context.business.contactPhone || context.business.forwardingPhone || '',
          businessType: context.business.businessType || '',
          workingHours: context.business.hoursSummary || '',
          pricingInfo: context.business.priceSummary || '',
          automationEnabled: context.business.automationEnabled !== false,
          status: context.business.status || 'pending_onboarding'
        },
        recentConversations
      };
    },

    async submitSmsOnboarding(payload) {
      const validation = validateOnboardingInput(payload);

      if (!validation.ok) {
        throw new BillingValidationError('Please correct the onboarding form.', validation.fieldErrors);
      }

      const context = await getCheckoutSessionContext(validation.sessionId);
      const assignedTwilioPhone = getAssignedTwilioPhone();

      if (!assignedTwilioPhone) {
        const error = new Error('Twilio is not configured for SMS activation.');
        error.statusCode = 503;
        throw error;
      }

      const existingPhoneOwner = await repositories.businesses.getByTwilioPhone(assignedTwilioPhone);

      if (existingPhoneOwner && existingPhoneOwner.id !== context.business.id) {
        throw new BillingValidationError('This Twilio number is already assigned to another business.', {
          phoneNumber: 'SMS activation is already connected to another business.'
        });
      }

      const business = await repositories.businesses.updateOnboardingProfile({
        id: context.business.id,
        name: validation.businessName,
        ownerName: validation.ownerName,
        contactEmail: validation.email,
        contactPhone: validation.phoneNumber,
        twilioPhone: assignedTwilioPhone,
        businessType: validation.businessType,
        hoursSummary: validation.workingHours,
        priceSummary: validation.pricingInfo,
        forwardingPhone: validation.phoneNumber,
        status: 'active'
      });

      await repositories.customers.upsertStripeCustomer({
        stripeCustomerId: context.stripeCustomerId,
        email: validation.email,
        name: validation.ownerName,
        companyName: validation.businessName,
        status: 'active',
        metadata: {
          source: 'sms-onboarding-submit'
        }
      });

      return {
        sessionId: context.sessionId,
        business,
        activation: {
          twilioPhone: assignedTwilioPhone
        }
      };
    },

    async updateSmsSettings(payload) {
      const validation = validateSettingsInput(payload);

      if (!validation.ok) {
        throw new BillingValidationError('Please correct the settings form.', validation.fieldErrors);
      }

      const context = await getCheckoutSessionContext(validation.sessionId);
      const business = await repositories.businesses.updateSettings({
        id: context.business.id,
        hoursSummary: validation.workingHours,
        priceSummary: validation.pricingInfo,
        automationEnabled: validation.automationEnabled
      });

      return {
        sessionId: context.sessionId,
        business: {
          id: business.id,
          name: business.name || '',
          phoneNumber: business.contactPhone || business.forwardingPhone || '',
          businessType: business.businessType || '',
          workingHours: business.hoursSummary || '',
          pricingInfo: business.priceSummary || '',
          automationEnabled: business.automationEnabled !== false,
          status: business.status || 'pending_onboarding'
        }
      };
    },

    async handleStripeEvent(event) {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;

          if (session.mode !== 'subscription' || !session.customer || !session.subscription) {
            return { handled: false, reason: 'not_subscription_checkout' };
          }

          await ensureCustomerAndBusiness({
            stripeCustomerId: session.customer,
            fallbackEmail: session.customer_details?.email || null,
            fallbackName: session.customer_details?.name || session.metadata?.contact_name || null,
            fallbackCompanyName: session.metadata?.company_name || null,
            source: 'checkout.session.completed',
            businessStatus: 'pending_onboarding'
          });

          await upsertSubscriptionFromStripe({
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            stripeCheckoutSessionId: session.id,
            fallbackEmail: session.customer_details?.email || null,
            fallbackName: session.customer_details?.name || session.metadata?.contact_name || null,
            fallbackCompanyName: session.metadata?.company_name || null
          });

          return { handled: true };
        }

        case 'customer.subscription.created': {
          const subscription = event.data.object;

          if (!subscription.customer || !subscription.id) {
            return { handled: false, reason: 'missing_subscription_customer' };
          }

          await upsertSubscriptionFromStripe({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer
          });

          return { handled: true };
        }

        case 'invoice.paid': {
          const invoice = event.data.object;

          if (!invoice.customer || !invoice.subscription) {
            return { handled: false, reason: 'missing_invoice_links' };
          }

          await upsertSubscriptionFromStripe({
            stripeSubscriptionId: invoice.subscription,
            stripeCustomerId: invoice.customer
          });

          return { handled: true };
        }

        default:
          return { handled: false, reason: 'ignored_event' };
      }
    }
  };
}
