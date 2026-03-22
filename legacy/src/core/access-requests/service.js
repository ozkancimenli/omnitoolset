import { getProductBySlug, PRODUCT_STATUS } from '../../config/product-catalog.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AccessRequestValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'AccessRequestValidationError';
    this.statusCode = 400;
    this.fieldErrors = fieldErrors;
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function validateLength(value, maxLength) {
  return value.length > 0 && value.length <= maxLength;
}

function resolveRequestType(product) {
  return product.status === PRODUCT_STATUS.BETA ? 'beta' : 'waitlist';
}

export function createAccessRequestService({ repositories }) {
  return {
    submit(payload) {
      const product = getProductBySlug(payload.productSlug);

      if (!product || !product.waitlistEnabled) {
        throw new AccessRequestValidationError('Invalid product selected.', {
          productSlug: 'Please choose a beta or waitlist product.'
        });
      }

      const name = normalizeText(payload.name);
      const email = normalizeEmail(payload.email);
      const company = normalizeText(payload.company);
      const note = normalizeText(payload.note ?? payload.notes);
      const sourcePath = normalizeText(payload.sourcePath ?? payload.returnTo);

      const fieldErrors = {};

      if (!validateLength(name, 120)) {
        fieldErrors.name = 'Please enter your name.';
      }

      if (!EMAIL_PATTERN.test(email) || email.length > 160) {
        fieldErrors.email = 'Please enter a valid email address.';
      }

      if (!validateLength(company, 160)) {
        fieldErrors.company = 'Please enter your company name.';
      }

      if (note.length > 1000) {
        fieldErrors.note = 'Please keep your note under 1000 characters.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new AccessRequestValidationError('Please correct the highlighted fields.', fieldErrors);
      }

      const request = repositories.accessRequests.create({
        productSlug: product.slug,
        requestType: resolveRequestType(product),
        name,
        email,
        company,
        note: note || null,
        sourcePath: sourcePath || product.pagePath
      });

      return {
        product,
        request
      };
    }
  };
}
