import { sanitizeReturnTo } from '../platform/view-models.js';

export function createAccessRequestController({ service }) {
  function buildSuccessRedirect(product, returnTo) {
    const safeReturnTo = sanitizeReturnTo(returnTo, product.pagePath);
    const separator = safeReturnTo.includes('?') ? '&' : '?';
    return `${safeReturnTo}${separator}access=success&product=${product.slug}`;
  }

  return {
    submitForm(req, res) {
      const { product } = service.submit({
        productSlug: req.body.productSlug,
        name: req.body.name,
        email: req.body.email,
        company: req.body.company,
        note: req.body.note ?? req.body.notes,
        sourcePath: req.body.returnTo,
        returnTo: req.body.returnTo
      });

      res.redirect(303, buildSuccessRedirect(product, req.body.returnTo));
    },

    submitApi(req, res) {
      const { product, request } = service.submit({
        productSlug: req.body.productSlug,
        name: req.body.name,
        email: req.body.email,
        company: req.body.company,
        note: req.body.note,
        sourcePath: req.body.sourcePath
      });

      res.status(201).json({
        ok: true,
        message: 'Early access request saved.',
        product: {
          slug: product.slug,
          name: product.name,
          requestType: request.request_type
        },
        request: {
          id: request.id,
          status: request.status
        }
      });
    }
  };
}
