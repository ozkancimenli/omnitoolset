function parseJson(value, fallback = {}) {
  if (!value) {
    return fallback;
  }

  return typeof value === 'object' ? value : fallback;
}

export function mapBusiness(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerCustomerId: row.owner_customer_id,
    ownerName: row.owner_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    twilioPhone: row.twilio_phone,
    timezone: row.timezone,
    forwardingPhone: row.forwarding_phone,
    businessType: row.business_type,
    servicesSummary: row.services_summary,
    hoursSummary: row.hours_summary,
    priceSummary: row.price_summary,
    automationEnabled: row.automation_enabled,
    status: row.status,
    onboardingCompletedAt: row.onboarding_completed_at,
    bookingDurationMinutes: row.booking_duration_minutes,
    bookingWindowDays: row.booking_window_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapContact(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    source: row.source,
    status: row.status,
    metadata: parseJson(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapConversation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    businessId: row.business_id,
    contactId: row.contact_id,
    channel: row.channel,
    status: row.status,
    currentStage: row.current_stage,
    metadata: parseJson(row.metadata),
    lastInboundAt: row.last_inbound_at,
    lastOutboundAt: row.last_outbound_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapConversationLog(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    businessId: row.business_id,
    contactId: row.contact_id,
    channel: row.channel,
    status: row.status,
    currentStage: row.current_stage,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    lastMessageText: row.last_message_text,
    lastMessageDirection: row.last_message_direction,
    lastMessageAt: row.last_message_at,
    updatedAt: row.updated_at
  };
}

export function mapMessage(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    businessId: row.business_id,
    conversationId: row.conversation_id,
    direction: row.direction,
    channel: row.channel,
    body: row.body,
    providerSid: row.provider_sid,
    fromPhone: row.from_phone,
    toPhone: row.to_phone,
    metadata: parseJson(row.metadata),
    createdAt: row.created_at
  };
}

export function mapBooking(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    businessId: row.business_id,
    conversationId: row.conversation_id,
    contactId: row.contact_id,
    requestedSlot: row.requested_slot,
    confirmedSlot: row.confirmed_slot,
    status: row.status,
    notes: row.notes,
    metadata: parseJson(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapAccessRequest(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    productSlug: row.product_slug,
    requestType: row.request_type,
    status: row.status,
    name: row.name,
    email: row.email,
    companyName: row.company_name,
    note: row.note,
    sourcePath: row.source_path,
    createdAt: row.created_at
  };
}

export function mapCustomer(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    stripeCustomerId: row.stripe_customer_id,
    email: row.email,
    name: row.name,
    companyName: row.company_name,
    status: row.status,
    metadata: parseJson(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapSubscription(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    customerId: row.customer_id,
    businessId: row.business_id,
    productModule: row.product_module,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePriceId: row.stripe_price_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    metadata: parseJson(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
