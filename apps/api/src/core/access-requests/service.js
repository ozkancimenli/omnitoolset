import { getProductBySlug } from '@omnitoolset/shared/products';

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
  return product.accessType === 'beta' ? 'beta' : 'waitlist';
}

export function createAccessRequestService({ repositories }) {
  return {
    async submit(payload) {
      const product = getProductBySlug(payload.productSlug);

      if (!product || product.accessType === 'live') {
        throw new AccessRequestValidationError('Invalid product selected.', {
          productSlug: 'Please choose a beta or waitlist product.'
        });
      }

      const name = normalizeText(payload.name);
      const email = normalizeEmail(payload.email);
      const companyName = normalizeText(payload.companyName || payload.company);
      const note = normalizeText(payload.note ?? payload.notes);
      const sourcePath = normalizeText(payload.sourcePath ?? payload.returnTo ?? product.routePath);
      const fieldErrors = {};

      if (!validateLength(name, 120)) {
        fieldErrors.name = 'Please enter your name.';
      }

      if (!EMAIL_PATTERN.test(email) || email.length > 160) {
        fieldErrors.email = 'Please enter a valid email address.';
      }

      if (!validateLength(companyName, 160)) {
        fieldErrors.companyName = 'Please enter your company name.';
      }

      if (note.length > 400) {
        fieldErrors.note = 'Please keep your note under 400 characters.';
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new AccessRequestValidationError('Please correct the form errors.', fieldErrors);
      }

      const request = await repositories.accessRequests.create({
        productSlug: product.slug,
        requestType: resolveRequestType(product),
        name,
        email,
        companyName,
        note: note || null,
        sourcePath
      });

      return {
        product,
        request
      };
    }
  };
}
