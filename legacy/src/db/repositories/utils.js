export function parseJson(value, fallback = {}) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function stringifyJson(value) {
  return JSON.stringify(value ?? {});
}

export function mapConversation(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function mapMessage(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function mapBooking(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function mapBusiness(row) {
  return row || null;
}

export function mapContact(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function mapLead(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function mapReviewRequest(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}
