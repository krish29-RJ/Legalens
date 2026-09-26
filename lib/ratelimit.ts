import { LEGALENS_CONFIG } from "./config";

interface RateLimitRecord {
  timestamps: number[];
}

const clientRequestMap = new Map<string, RateLimitRecord>();

// Clean up stale client entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const windowMs = LEGALENS_CONFIG.RATE_LIMIT.WINDOW_MS;
    for (const [key, record] of clientRequestMap.entries()) {
      record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        clientRequestMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(clientId: string): RateLimitResult {
  const now = Date.now();
  const windowMs = LEGALENS_CONFIG.RATE_LIMIT.WINDOW_MS;
  const maxRequests = LEGALENS_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_WINDOW;

  let record = clientRequestMap.get(clientId);
  if (!record) {
    record = { timestamps: [] };
    clientRequestMap.set(clientId, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0] || now;
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
