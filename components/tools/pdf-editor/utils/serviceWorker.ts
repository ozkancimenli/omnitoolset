// Service Worker Registration and Management
// Provides offline support and advanced caching

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  /**
   * Register service worker
   */
  async register(swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('[ServiceWorker] Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
      });

      console.log('[ServiceWorker] Registered:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[ServiceWorker] New version available');
              this.onUpdateAvailable();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const unregistered = await this.registration.unregister();
      if (unregistered) {
        console.log('[ServiceWorker] Unregistered');
        this.registration = null;
      }
      return unregistered;
    } catch (error) {
      console.error('[ServiceWorker] Unregister failed:', error);
      return false;
    }
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return !!this.registration?.active;
  }

  /**
   * Get service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: any): Promise<any> {
    if (!this.registration?.active) {
      throw new Error('Service worker not active');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }

  /**
   * Handle update available
   */
  private onUpdateAvailable(): void {
    // This would trigger a UI notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-update-available'));
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('[ServiceWorker] Update check completed');
    } catch (error) {
      console.error('[ServiceWorker] Update failed:', error);
    }
  }
}

// Singleton instance
let swManagerInstance: ServiceWorkerManager | null = null;

export const getServiceWorkerManager = (): ServiceWorkerManager => {
  if (!swManagerInstance) {
    swManagerInstance = new ServiceWorkerManager();
  }
  return swManagerInstance;
};

