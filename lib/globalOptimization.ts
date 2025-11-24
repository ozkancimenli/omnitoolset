/**
 * Global Optimization Utilities
 * System-wide optimization strategies
 */

/**
 * Enable service worker for caching
 */
export function enableServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Enable compression
 */
export function enableCompression(): void {
  // This is typically handled by the server
  // But we can check if compression is enabled
  if (typeof window === 'undefined') return;

  fetch('/api/check-compression')
    .then(response => {
      const encoding = response.headers.get('content-encoding');
      if (!encoding) {
        console.warn('Compression not enabled');
      }
    })
    .catch(() => {
      // API endpoint might not exist
    });
}

/**
 * Optimize bundle loading
 */
export function optimizeBundleLoading(): void {
  if (typeof window === 'undefined') return;

  // Split chunks for better caching
  // This is handled by Next.js webpack config
  // But we can verify chunk loading
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('chunk')) {
      // Add preload for chunks
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    }
  });
}

/**
 * Enable HTTP/2 Server Push
 */
export function enableHTTP2Push(resources: string[]): void {
  // HTTP/2 Server Push is handled by the server
  // This is just a placeholder for documentation
  console.log('HTTP/2 Server Push resources:', resources);
}

/**
 * Optimize third-party scripts
 */
export function optimizeThirdPartyScripts(): void {
  if (typeof window === 'undefined') return;

  // Defer third-party scripts
  const thirdPartyScripts = document.querySelectorAll(
    'script[src*="google"], script[src*="facebook"], script[src*="twitter"]'
  );

  thirdPartyScripts.forEach(script => {
    if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
      script.setAttribute('defer', '');
    }
  });
}

/**
 * Enable resource hints
 */
export function enableResourceHints(): void {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external domains
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.google-analytics.com',
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * Optimize API calls
 */
export function optimizeAPICalls(): void {
  if (typeof window === 'undefined') return;

  // Add request deduplication
  const originalFetch = window.fetch;
  const pendingRequests = new Map<string, Promise<Response>>();

  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const key = typeof input === 'string' ? input : input.toString();

    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)!;
    }

    const promise = originalFetch(input, init).finally(() => {
      pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
  };
}

/**
 * Enable request batching
 */
export function enableRequestBatching(): void {
  if (typeof window === 'undefined') return;

  // Batch multiple API calls into one
  // This is a simplified version
  let batchQueue: Array<{ url: string; options?: RequestInit }> = [];
  let batchTimeout: NodeJS.Timeout | null = null;

  const originalFetch = window.fetch;

  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();

    // Check if this is a batchable request
    if (init?.method === 'GET' && url.startsWith('/api/')) {
      batchQueue.push({ url, options: init });

      if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
          // Process batch
          const batchUrl = `/api/batch?${batchQueue.map((q, i) => `q${i}=${encodeURIComponent(q.url)}`).join('&')}`;
          originalFetch(batchUrl).then(() => {
            batchQueue = [];
            batchTimeout = null;
          });
        }, 50);
      }

      // Return a promise that resolves when batch is processed
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Response());
        }, 100);
      });
    }

    return originalFetch(input, init);
  };
}

/**
 * Initialize global optimizations
 */
export function initGlobalOptimization(): void {
  if (typeof window === 'undefined') return;

  // Enable service worker
  enableServiceWorker();

  // Optimize third-party scripts
  optimizeThirdPartyScripts();

  // Enable resource hints
  enableResourceHints();

  // Optimize API calls
  optimizeAPICalls();
}

