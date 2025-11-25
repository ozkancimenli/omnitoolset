/**
 * Global Performance Utilities
 * System-wide performance optimizations
 */

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Preload fonts
  const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkEl = document.createElement('link');
      linkEl.rel = 'preload';
      linkEl.as = 'font';
      linkEl.href = href;
      linkEl.crossOrigin = 'anonymous';
      document.head.appendChild(linkEl);
    }
  });

  // Preload critical CSS
  const criticalCSS = document.querySelector('style[data-critical]');
  if (criticalCSS) {
    // Critical CSS already inlined
  }
}

/**
 * Defer non-critical resources
 */
export function deferNonCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Defer images below the fold
  const images = document.querySelectorAll('img[data-defer]');
  images.forEach(img => {
    const src = img.getAttribute('data-src');
    if (src) {
      img.setAttribute('src', src);
      img.removeAttribute('data-src');
    }
  });
}

/**
 * Optimize images
 */
export function optimizeImages(): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" if not present
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }

    // Add decoding="async"
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

/**
 * Prefetch routes
 */
export function prefetchRoutes(routes: string[]): void {
  if (typeof window === 'undefined') return;

  routes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to external domains
 */
export function preconnectDomains(domains: string[]): void {
  if (typeof window === 'undefined') return;

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Measure Core Web Vitals
 */
export function measureCoreWebVitals(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // Measure LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Browser doesn't support LCP
  }

  // Measure FID (First Input Delay)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // Browser doesn't support FID
  }

  // Measure CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Browser doesn't support CLS
  }
}

/**
 * Optimize fonts
 */
export function optimizeFonts(): void {
  if (typeof window === 'undefined') return;

  // Add font-display: swap to all font faces
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize performance optimizations
 */
export function initGlobalPerformance(): void {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  measureCoreWebVitals();

  // Preload critical resources
  preloadCriticalResources();

  // Optimize images
  optimizeImages();

  // Defer non-critical resources
  if (document.readyState === 'complete') {
    deferNonCriticalResources();
  } else {
    window.addEventListener('load', deferNonCriticalResources);
  }
}

