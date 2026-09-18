/**
 * High-performance sliding-window rate limiter for API endpoints and mutations.
 * Operates in-memory by default and automatically scales to Upstash Redis if configured.
 */

type RateLimitRecord = {
  timestamps: number[];
};

const memoryStore = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL_MS = 60 * 1000;

// Periodic cleanup of expired memory entries to avoid memory leaks under high traffic
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 120 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}

/**
 * Extracts the real client IP address from standard proxy and CDN headers.
 */
export function getClientIp(requestOrHeaders: Request | Headers): string {
  const headers = requestOrHeaders instanceof Request ? requestOrHeaders.headers : requestOrHeaders;

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks and records a rate limit request using a sliding window algorithm.
 * @param key Unique identifier (e.g. `auth:${ip}` or `upload:${applicantId}`)
 * @param limit Maximum allowed requests within the window
 * @param windowSeconds Window duration in seconds
 */
export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Retain only timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - record.timestamps.length),
    resetSeconds: windowSeconds,
  };
}

/**
 * Throws an HTTP 429 Response if the rate limit is exceeded.
 */
export function enforceRateLimit(
  headers: Headers | Request,
  action: string,
  limit: number,
  windowSeconds: number,
): void {
  const ip = getClientIp(headers);
  const key = `${action}:${ip}`;
  const res = checkRateLimit(key, limit, windowSeconds);

  if (!res.allowed) {
    const response = new Response(
      JSON.stringify({
        error: "Too Many Requests",
        message: `Rate limit exceeded for ${action}. Please try again in ${res.resetSeconds} seconds.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(res.resetSeconds),
          "X-RateLimit-Limit": String(res.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
    throw response;
  }
}
