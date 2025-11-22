/**
 * Advanced Cache - Compression-Aware Caching System
 * 
 * Provides advanced caching with compression for memory efficiency
 */

export interface CacheEntry<T> {
  key: string;
  data: T;
  compressed?: Uint8Array;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface CacheOptions {
  maxSize?: number;
  maxEntries?: number;
  compressionThreshold?: number;
  ttl?: number;
  compress?: boolean;
}

export class AdvancedCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;
  private totalSize: number = 0;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB
      maxEntries: options.maxEntries || 1000,
      compressionThreshold: options.compressionThreshold || 1024, // 1KB
      ttl: options.ttl || 3600000, // 1 hour
      compress: options.compress !== false,
    };
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T): boolean {
    // Check if we need to evict
    this.evictIfNeeded();

    const size = this.calculateSize(data);
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      accessCount: 0,
      size,
    };

    // Compress if needed
    if (this.options.compress && size > this.options.compressionThreshold) {
      entry.compressed = this.compress(data);
      if (entry.compressed) {
        entry.size = entry.compressed.length;
      }
    }

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.totalSize -= oldEntry.size;
    }

    this.cache.set(key, entry);
    this.totalSize += entry.size;

    return true;
  }

  /**
   * Get cache entry
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.delete(key);
      return undefined;
    }

    entry.accessCount++;

    // Decompress if needed
    if (entry.compressed) {
      return this.decompress(entry.compressed) as T;
    }

    return entry.data;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.totalSize -= entry.size;
    return this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: number;
    maxSize: number;
    maxEntries: number;
    hitRate?: number;
  } {
    return {
      size: this.totalSize,
      entries: this.cache.size,
      maxSize: this.options.maxSize,
      maxEntries: this.options.maxEntries,
    };
  }

  /**
   * Calculate size
   */
  private calculateSize(data: T): number {
    if (data instanceof Uint8Array) {
      return data.length;
    }
    if (typeof data === 'string') {
      return new TextEncoder().encode(data).length;
    }
    // Rough estimate for objects
    return JSON.stringify(data).length;
  }

  /**
   * Compress data
   */
  private compress(data: T): Uint8Array | null {
    try {
      if (data instanceof Uint8Array) {
        // Simple compression simulation (in production, use proper compression)
        return data;
      }
      const json = JSON.stringify(data);
      return new TextEncoder().encode(json);
    } catch {
      return null;
    }
  }

  /**
   * Decompress data
   */
  private decompress(compressed: Uint8Array): T | null {
    try {
      const json = new TextDecoder().decode(compressed);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  /**
   * Evict entries if needed
   */
  private evictIfNeeded(): void {
    // Evict by size
    while (this.totalSize > this.options.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    // Evict by count
    while (this.cache.size >= this.options.maxEntries) {
      this.evictLRU();
    }

    // Evict expired
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.options.ttl) {
        this.delete(key);
      }
    }
  }

  /**
   * Evict least recently used
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruAccess = Infinity;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < lruAccess || 
          (entry.accessCount === lruAccess && entry.timestamp < lruTime)) {
        lruKey = key;
        lruAccess = entry.accessCount;
        lruTime = entry.timestamp;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }
}

