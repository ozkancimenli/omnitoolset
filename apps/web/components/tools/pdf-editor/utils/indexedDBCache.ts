// IndexedDB Cache for PDF Documents
// Provides persistent caching for PDFs and their metadata

interface CacheEntry {
  key: string;
  data: ArrayBuffer | Blob;
  metadata: {
    timestamp: number;
    size: number;
    type: 'pdf' | 'thumbnail' | 'rendered-page';
    pageNumber?: number;
  };
}

class IndexedDBCache {
  private dbName = 'pdf-editor-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private maxSize: number = 100 * 1024 * 1024; // 100MB
  private currentSize: number = 0;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.calculateSize().then(() => resolve());
      };

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pdfs')) {
          const store = db.createObjectStore('pdfs', { keyPath: 'key' });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
          store.createIndex('type', 'metadata.type', { unique: false });
        }
      };
    });
  }

  /**
   * Store data in cache
   */
  async set(key: string, data: ArrayBuffer | Blob, metadata: Partial<CacheEntry['metadata']>): Promise<void> {
    if (!this.db) await this.init();

    const entry: CacheEntry = {
      key,
      data,
      metadata: {
        timestamp: Date.now(),
        size: data instanceof Blob ? data.size : data.byteLength,
        type: metadata.type || 'pdf',
        ...metadata,
      },
    };

    // Check if we need to evict old entries
    await this.evictIfNeeded(entry.metadata.size);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const request = store.put(entry);

      request.onsuccess = () => {
        this.currentSize += entry.metadata.size;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from cache
   */
  async get(key: string): Promise<CacheEntry | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          // Update access time
          entry.metadata.timestamp = Date.now();
          this.set(key, entry.data, entry.metadata);
        }
        resolve(entry || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete entry from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const request = store.clear();

      request.onsuccess = () => {
        this.currentSize = 0;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size
   */
  async getSize(): Promise<number> {
    if (!this.db) await this.init();
    await this.calculateSize();
    return this.currentSize;
  }

  /**
   * Calculate current cache size
   */
  private async calculateSize(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        this.currentSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);
        resolve();
      };
    });
  }

  /**
   * Evict old entries if cache is too large
   */
  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    if (this.currentSize + newEntrySize <= this.maxSize) return;

    // Get all entries sorted by timestamp (oldest first)
    const transaction = this.db!.transaction(['pdfs'], 'readwrite');
    const store = transaction.objectStore('pdfs');
    const index = store.index('timestamp');
    const request = index.openCursor();

    request.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor && this.currentSize + newEntrySize > this.maxSize) {
        const entry = cursor.value as CacheEntry;
        this.currentSize -= entry.metadata.size;
        cursor.delete();
        cursor.continue();
      }
    };
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let cacheInstance: IndexedDBCache | null = null;

export const getCache = (): IndexedDBCache => {
  if (!cacheInstance) {
    cacheInstance = new IndexedDBCache();
  }
  return cacheInstance;
};

export default IndexedDBCache;

