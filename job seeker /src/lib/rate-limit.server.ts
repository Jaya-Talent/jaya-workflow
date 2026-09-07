/**
 * Sliding Window Rate Limiter for server functions and API handlers.
 * Protects endpoints against brute-force attacks, spam, and API quota abuse.
 */

type RateLimitRecord = {
  timestamps: number[];
};

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 300_000);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 300_000).unref?.();

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

/**
 * Checks and records a request against a rate limit window.
 * 
 * @param identifier IP address, user ID, or composite key (e.g., "login:1.2.3.4")
 * @param limit Maximum allowed requests within the window
 * @param windowMs Time window in milliseconds (default: 60000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  let record = store.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    store.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTs = record.timestamps[0] ?? now;
    const resetMs = Math.max(0, windowMs - (now - oldestTs));
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}
