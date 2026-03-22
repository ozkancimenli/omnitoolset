const SECRET_KEY_PATTERN = /(token|secret|password|authorization|api[-_]?key|signature)/i;

function sanitizeValue(key, value) {
  if (SECRET_KEY_PATTERN.test(key)) {
    return '[redacted]';
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(key, entry));
  }

  if (value && typeof value === 'object') {
    return sanitizeContext(value);
  }

  if (typeof value === 'string' && value.length > 500) {
    return `${value.slice(0, 497)}...`;
  }

  return value;
}

function sanitizeContext(context = {}) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, sanitizeValue(key, value)])
  );
}

function write(level, message, context = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeContext(context)
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function maskPhoneNumber(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length <= 4) {
    return '***';
  }

  return `***${digits.slice(-4)}`;
}

export function maskIdentifier(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function previewText(value, maxLength = 80) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length <= maxLength ? cleaned : `${cleaned.slice(0, maxLength - 3)}...`;
}

export const logger = {
  info(message, context) {
    write('info', message, context);
  },

  warn(message, context) {
    write('warn', message, context);
  },

  error(message, context) {
    write('error', message, context);
  }
};
