export function createFakeRepositories() {
  const defaultBusiness = {
    id: 1,
    name: 'Northstar Health',
    slug: 'northstar-health',
    ownerCustomerId: null,
    ownerName: null,
    contactEmail: null,
    contactPhone: null,
    twilioPhone: null,
    timezone: 'America/New_York',
    forwardingPhone: '',
    businessType: 'local health clinic',
    servicesSummary: 'Consultations and appointment scheduling',
    hoursSummary: 'Mon-Fri, 9:00 AM to 5:00 PM',
    priceSummary: 'Most visits start at $75, and exact pricing depends on the service.',
    automationEnabled: true,
    status: 'demo',
    bookingDurationMinutes: 45,
    bookingWindowDays: 10,
    onboardingCompletedAt: null
  };
  const store = {
    contacts: [],
    conversations: [],
    messages: [],
    bookings: [],
    workflowRuns: [],
    accessRequests: [],
    customers: [],
    subscriptions: [],
    businesses: [defaultBusiness]
  };

  return {
    businesses: {
      async getByTwilioPhone(phone) {
        return store.businesses.find((entry) => entry.twilioPhone === phone) || null;
      },
      async ensureBusiness() {
        return defaultBusiness;
      },
      async getBySlug(slug) {
        return store.businesses.find((entry) => entry.slug === slug) || null;
      },
      async findByOwnerCustomerId(ownerCustomerId) {
        return store.businesses.find((entry) => entry.ownerCustomerId === ownerCustomerId) || null;
      },
      async createOwnedBusiness(payload) {
        const business = {
          id: store.businesses.length + 1,
          automationEnabled: payload.automationEnabled ?? true,
          onboardingCompletedAt: null,
          ...payload
        };
        store.businesses.push(business);
        return business;
      },
      async updateOnboardingProfile(payload) {
        const business = store.businesses.find((entry) => entry.id === payload.id);
        Object.assign(business, {
          name: payload.name ?? business.name,
          ownerName: payload.ownerName ?? business.ownerName,
          contactEmail: payload.contactEmail ?? business.contactEmail,
          contactPhone: payload.contactPhone ?? business.contactPhone,
          twilioPhone: payload.twilioPhone ?? business.twilioPhone,
          businessType: payload.businessType ?? business.businessType,
          hoursSummary: payload.hoursSummary ?? business.hoursSummary,
          priceSummary: payload.priceSummary ?? business.priceSummary,
          forwardingPhone: payload.forwardingPhone ?? business.forwardingPhone,
          automationEnabled: payload.automationEnabled ?? business.automationEnabled,
          status: payload.status ?? business.status,
          onboardingCompletedAt: new Date().toISOString()
        });
        return business;
      },
      async updateSettings(payload) {
        const business = store.businesses.find((entry) => entry.id === payload.id);
        Object.assign(business, {
          hoursSummary: payload.hoursSummary ?? business.hoursSummary,
          priceSummary: payload.priceSummary ?? business.priceSummary,
          automationEnabled: payload.automationEnabled ?? business.automationEnabled
        });
        return business;
      }
    },
    contacts: {
      async findOrCreate({ businessId, phone, name, source, status }) {
        const existing = store.contacts.find((entry) => entry.businessId === businessId && entry.phone === phone);

        if (existing) {
          return existing;
        }

        const contact = {
          id: store.contacts.length + 1,
          businessId,
          phone,
          name,
          source,
          status,
          metadata: {}
        };
        store.contacts.push(contact);
        return contact;
      }
    },
    conversations: {
      async findOrCreate({ businessId, contactId, channel }) {
        const existing = store.conversations.find(
          (entry) => entry.businessId === businessId && entry.contactId === contactId && entry.channel === channel
        );

        if (existing) {
          return existing;
        }

        const conversation = {
          id: store.conversations.length + 1,
          businessId,
          contactId,
          channel,
          status: 'open',
          currentStage: 'new',
          metadata: {},
          lastInboundAt: null,
          lastOutboundAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        store.conversations.push(conversation);
        return conversation;
      },
      async saveState({ id, status, currentStage, metadata, lastInboundAt, lastOutboundAt }) {
        const conversation = store.conversations.find((entry) => entry.id === id);
        Object.assign(conversation, {
          status: status ?? conversation.status,
          currentStage: currentStage ?? conversation.currentStage,
          metadata: metadata ?? conversation.metadata,
          lastInboundAt: lastInboundAt ?? conversation.lastInboundAt,
          lastOutboundAt: lastOutboundAt ?? conversation.lastOutboundAt,
          updatedAt: new Date().toISOString()
        });
        return conversation;
      },
      async listRecentByBusiness(businessId, limit) {
        return store.conversations
          .filter((entry) => entry.businessId === businessId)
          .map((conversation) => {
            const contact = store.contacts.find((entry) => entry.id === conversation.contactId) || null;
            const lastMessage = [...store.messages]
              .filter((entry) => entry.conversationId === conversation.id)
              .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];

            return {
              id: conversation.id,
              businessId: conversation.businessId,
              contactId: conversation.contactId,
              channel: conversation.channel,
              status: conversation.status,
              currentStage: conversation.currentStage,
              contactName: contact?.name || null,
              contactPhone: contact?.phone || null,
              lastMessageText: lastMessage?.body || null,
              lastMessageDirection: lastMessage?.direction || null,
              lastMessageAt: lastMessage?.createdAt || null,
              updatedAt: conversation.updatedAt || conversation.createdAt
            };
          })
          .sort((left, right) => {
            const leftTime = new Date(left.lastMessageAt || left.updatedAt).getTime();
            const rightTime = new Date(right.lastMessageAt || right.updatedAt).getTime();
            return rightTime - leftTime;
          })
          .slice(0, limit);
      }
    },
    messages: {
      async create(payload) {
        const message = {
          id: store.messages.length + 1,
          ...payload,
          createdAt: new Date().toISOString()
        };
        store.messages.push(message);
        return message;
      },
      async listRecentByConversation(conversationId, limit) {
        return store.messages.filter((entry) => entry.conversationId === conversationId).slice(-limit);
      },
      async existsByProviderSid(providerSid) {
        return store.messages.some((entry) => entry.providerSid === providerSid);
      }
    },
    bookings: {
      async latestByConversation(conversationId) {
        return [...store.bookings].reverse().find((entry) => entry.conversationId === conversationId) || null;
      },
      async saveForConversation(payload) {
        const existing = [...store.bookings].reverse().find((entry) => entry.conversationId === payload.conversationId);

        if (existing) {
          Object.assign(existing, payload);
          return existing;
        }

        const booking = {
          id: store.bookings.length + 1,
          ...payload
        };
        store.bookings.push(booking);
        return booking;
      }
    },
    accessRequests: {
      async create(payload) {
        const request = {
          id: store.accessRequests.length + 1,
          ...payload
        };
        store.accessRequests.push(request);
        return request;
      }
    },
    customers: {
      async getByStripeCustomerId(stripeCustomerId) {
        return store.customers.find((entry) => entry.stripeCustomerId === stripeCustomerId) || null;
      },
      async upsertStripeCustomer(payload) {
        const existing = store.customers.find((entry) => entry.stripeCustomerId === payload.stripeCustomerId);

        if (existing) {
          Object.assign(existing, payload);
          return existing;
        }

        const customer = {
          id: store.customers.length + 1,
          ...payload
        };
        store.customers.push(customer);
        return customer;
      }
    },
    subscriptions: {
      async getByStripeSubscriptionId(stripeSubscriptionId) {
        return (
          store.subscriptions.find((entry) => entry.stripeSubscriptionId === stripeSubscriptionId) || null
        );
      },
      async upsertStripeSubscription(payload) {
        const existing = store.subscriptions.find(
          (entry) => entry.stripeSubscriptionId === payload.stripeSubscriptionId
        );

        if (existing) {
          Object.assign(existing, payload);
          return existing;
        }

        const subscription = {
          id: store.subscriptions.length + 1,
          ...payload
        };
        store.subscriptions.push(subscription);
        return subscription;
      }
    },
    workflowRuns: {
      async create(payload) {
        const run = {
          id: store.workflowRuns.length + 1,
          workflow_key: payload.workflowKey,
          workflow_name: payload.workflowName,
          trigger_source: payload.triggerSource,
          status: payload.status || 'running',
          input_payload: payload.inputPayload || {},
          output_payload: null,
          error_message: null,
          step_trace: payload.stepTrace || [],
          created_at: new Date().toISOString(),
          completed_at: null
        };

        store.workflowRuns.push(run);
        return run;
      },
      async complete({ id, status = 'completed', outputPayload = {}, stepTrace = [] }) {
        const run = store.workflowRuns.find((entry) => entry.id === id);
        Object.assign(run, {
          status,
          output_payload: outputPayload,
          step_trace: stepTrace,
          completed_at: new Date().toISOString()
        });
        return run;
      },
      async fail({ id, errorMessage, stepTrace = [] }) {
        const run = store.workflowRuns.find((entry) => entry.id === id);
        Object.assign(run, {
          status: 'failed',
          error_message: errorMessage,
          step_trace: stepTrace,
          completed_at: new Date().toISOString()
        });
        return run;
      },
      async listRecent(limit) {
        return [...store.workflowRuns]
          .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
          .slice(0, limit);
      }
    },
    __store: store
  };
}

export function createFakeStripe() {
  const stripeCustomer = {
    id: 'cus_test_123',
    email: 'jordan@example.com',
    name: 'Jordan Lee',
    metadata: {
      company_name: 'Northstar Health',
      product_module: 'sms_assistant'
    }
  };

  return {
    customers: {
      async list() {
        return { data: [] };
      },
      async create(payload) {
        return {
          ...stripeCustomer,
          ...payload,
          metadata: payload.metadata
        };
      },
      async update(id, payload) {
        return {
          ...stripeCustomer,
          id,
          ...payload,
          metadata: payload.metadata
        };
      },
      async retrieve(id) {
        return {
          ...stripeCustomer,
          id
        };
      }
    },
    checkout: {
      sessions: {
        async create() {
          return {
            id: 'cs_test_123',
            url: 'https://checkout.stripe.test/session'
          };
        },
        async retrieve(id) {
          return {
            id,
            mode: 'subscription',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            customer_details: {
              email: 'jordan@example.com',
              name: 'Jordan Lee'
            },
            metadata: {
              company_name: 'Northstar Health',
              contact_name: 'Jordan Lee'
            }
          };
        }
      }
    },
    subscriptions: {
      async retrieve(id) {
        return {
          id,
          status: 'active',
          cancel_at_period_end: false,
          collection_method: 'charge_automatically',
          items: {
            data: [
              {
                price: {
                  id: 'price_test_123'
                },
                current_period_start: 1735689600,
                current_period_end: 1738368000
              }
            ]
          }
        };
      }
    }
  };
}
