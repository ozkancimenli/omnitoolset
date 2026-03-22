function resolveSuccessProductName(productSlug) {
  const products = Array.isArray(window.__OMNITOOLSET_PRODUCTS__)
    ? window.__OMNITOOLSET_PRODUCTS__
    : [];

  return products.find((product) => product.slug === productSlug)?.name || 'this product';
}

function showAccessSuccessBanner() {
  const params = new URLSearchParams(window.location.search);
  const requestSucceeded = params.get('access') === 'success' || params.get('waitlist') === 'success';
  const productSlug = params.get('product');

  if (!requestSucceeded || !productSlug) {
    return;
  }

  const banner = document.querySelector('[data-access-success-banner]');

  if (!banner || banner.textContent.trim()) {
    return;
  }

  const productName = resolveSuccessProductName(productSlug);
  banner.innerHTML = `Early access request saved for <strong>${productName}</strong>.`;
  banner.classList.remove('is-hidden');

  params.delete('access');
  params.delete('waitlist');
  params.delete('product');

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
}

document.addEventListener('DOMContentLoaded', showAccessSuccessBanner);
