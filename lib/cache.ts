import { createHash } from "crypto";
import { LEGALENS_CONFIG } from "./config";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

/**
 * High-performance In-Memory LRU Cache with TTL and SHA-256 Key Hashing.
 * Dramatically boosts efficiency by eliminating duplicate LLM API calls.
 */
class AnalysisCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTtlMs: number;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(
    maxEntries = LEGALENS_CONFIG.CACHE?.MAX_ENTRIES ?? 500,
    defaultTtlMs = LEGALENS_CONFIG.CACHE?.TTL_MS ?? 1800000
  ) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic SHA-256 hash for cache lookup.
   */
  public generateKey(params: {
    mode: string;
    document: string;
    second?: string;
    question?: string;
    targetLanguage?: string;
    model: string;
  }): string {
    const raw = `${params.mode}::${params.model}::${params.targetLanguage || ""}::${params.question || ""}::${params.second || ""}::${params.document}`;
    return createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Retrieves an item from the cache. Returns null if missing or expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    // LRU: refresh entry order on access
    entry.hits++;
    this.store.delete(key);
    this.store.set(key, entry);

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Stores an item in the cache with automatic LRU eviction.
   */
  public set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    // Evict oldest entry if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    this.store.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clears the entire cache or removes expired keys.
   */
  public prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }

  public getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: `${hitRate.toFixed(1)}%`,
    };
  }
}

// Global singleton instance for serverless / edge runtime
export const analysisCache = new AnalysisCache();
