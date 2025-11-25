/**
 * Progressive Web App Utilities
 * PWA features and optimizations
 */

/**
 * Install PWA
 */
export async function installPWA(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
}

/**
 * Check if PWA is installable
 */
export function isPWAInstallable(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false;
  }

  // Check if beforeinstallprompt event is available
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const deferredPrompt = (window as any).deferredPrompt;
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    (window as any).deferredPrompt = null;
    return true;
  }

  return false;
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Get app install status
 */
export function getAppInstallStatus(): {
  isInstalled: boolean;
  isInstallable: boolean;
  canInstall: boolean;
} {
  return {
    isInstalled: isAppInstalled(),
    isInstallable: isPWAInstallable(),
    canInstall: isPWAInstallable() && !isAppInstalled(),
  };
}

/**
 * Initialize PWA
 */
export function initPWA(): void {
  if (typeof window === 'undefined') return;

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      installPWA();
    });
  }

  // Handle beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
  });

  // Handle app installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    (window as any).deferredPrompt = null;
  });
}

/**
 * Update service worker
 */
export function updateServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });
}

/**
 * Check for updates
 */
export function checkForUpdates(callback: (updateAvailable: boolean) => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    callback(false);
    return;
  }

  navigator.serviceWorker.getRegistration().then(registration => {
    if (!registration) {
      callback(false);
      return;
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            callback(true);
          }
        });
      }
    });

    registration.update();
  });
}

/**
 * Offline detection
 */
export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return !navigator.onLine;
}

/**
 * Online/offline event handlers
 */
export function onOnline(callback: () => void): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', callback);
}

export function onOffline(callback: () => void): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('offline', callback);
}

/**
 * Get network status
 */
export function getNetworkStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof window === 'undefined') {
    return { online: false };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

