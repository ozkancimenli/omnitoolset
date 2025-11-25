/**
 * Advanced Caching Strategies
 * System-wide advanced caching mechanisms
 */

/**
 * Cache strategies
 */
export enum CacheStrategy {
  NETWORK_FIRST = 'network-first',
  CACHE_FIRST = 'cache-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  NETWORK_ONLY = 'network-only',
  CACHE_ONLY = 'cache-only',
}

/**
 * Cache manager with TTL support
 */
export class AdvancedCacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Set cache with TTL
   */
  set(key: string, data: any, ttl: number = 3600000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestEntry = this.cache.keys().next()
      if (!oldestEntry.done && typeof oldestEntry.value === 'string') {
        this.cache.delete(oldestEntry.value)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * IndexedDB cache for persistent storage
 */
export class IndexedDBCache {
  private dbName: string;
  private version: number;
  private storeName: string;

  constructor(dbName: string = 'omnitoolset-cache', version: number = 1, storeName: string = 'cache') {
    this.dbName = dbName;
    this.version = version;
    this.storeName = storeName;
  }

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Set cache
   */
  async set(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache
   */
  async get(key: string): Promise<any | null> {
    const db = await this.init();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          // Expired, delete and return null
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cache
   */
  async delete(key: string): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Cache with strategy
 */
export async function cacheWithStrategy(
  key: string,
  fetcher: () => Promise<any>,
  strategy: CacheStrategy = CacheStrategy.STALE_WHILE_REVALIDATE,
  ttl: number = 3600000
): Promise<any> {
  const memoryCache = new AdvancedCacheManager();
  const indexedDBCache = new IndexedDBCache();

  // Try memory cache first
  const memoryData = memoryCache.get(key);
  if (memoryData && strategy === CacheStrategy.CACHE_ONLY) {
    return memoryData;
  }

  // Try IndexedDB cache
  const dbData = await indexedDBCache.get(key);
  if (dbData && strategy === CacheStrategy.CACHE_ONLY) {
    memoryCache.set(key, dbData, ttl);
    return dbData;
  }

  switch (strategy) {
    case CacheStrategy.NETWORK_FIRST:
      try {
        const networkData = await fetcher();
        memoryCache.set(key, networkData, ttl);
        await indexedDBCache.set(key, networkData, ttl);
        return networkData;
      } catch (error) {
        if (memoryData) return memoryData;
        if (dbData) return dbData;
        throw error;
      }

    case CacheStrategy.CACHE_FIRST:
      if (memoryData) return memoryData;
      if (dbData) {
        memoryCache.set(key, dbData, ttl);
        return dbData;
      }
      const networkData = await fetcher();
      memoryCache.set(key, networkData, ttl);
      await indexedDBCache.set(key, networkData, ttl);
      return networkData;

    case CacheStrategy.STALE_WHILE_REVALIDATE:
      if (memoryData) {
        // Revalidate in background
        fetcher().then(networkData => {
          memoryCache.set(key, networkData, ttl);
          indexedDBCache.set(key, networkData, ttl);
        }).catch(() => {
          // Ignore errors in background revalidation
        });
        return memoryData;
      }
      if (dbData) {
        memoryCache.set(key, dbData, ttl);
        // Revalidate in background
        fetcher().then(networkData => {
          memoryCache.set(key, networkData, ttl);
          indexedDBCache.set(key, networkData, ttl);
        }).catch(() => {
          // Ignore errors in background revalidation
        });
        return dbData;
      }
      const freshData = await fetcher();
      memoryCache.set(key, freshData, ttl);
      await indexedDBCache.set(key, freshData, ttl);
      return freshData;

    case CacheStrategy.NETWORK_ONLY:
      const networkOnlyData = await fetcher();
      memoryCache.set(key, networkOnlyData, ttl);
      await indexedDBCache.set(key, networkOnlyData, ttl);
      return networkOnlyData;

    case CacheStrategy.CACHE_ONLY:
      if (memoryData) return memoryData;
      if (dbData) return dbData;
      throw new Error('Cache miss');

    default:
      throw new Error('Unknown cache strategy');
  }
}

/**
 * Prefetch and cache
 */
export async function prefetchAndCache(
  key: string,
  fetcher: () => Promise<any>,
  ttl: number = 3600000
): Promise<void> {
  try {
    const data = await fetcher();
    const memoryCache = new AdvancedCacheManager();
    const indexedDBCache = new IndexedDBCache();
    memoryCache.set(key, data, ttl);
    await indexedDBCache.set(key, data, ttl);
  } catch (error) {
    console.warn('Prefetch failed:', error);
  }
}
