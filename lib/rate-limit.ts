// Production-grade sliding window rate limiter for auth endpoints

interface RateLimitOptions {
  windowMs: number; // Duration of rate limit window in milliseconds
  max: number;      // Maximum requests allowed in windowMs
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface ClientTracker {
  timestamps: number[];
}

const trackerStore = new Map<string, ClientTracker>();

// Periodic cleanup of stale tracking entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of trackerStore.entries()) {
      // Filter out timestamps older than 10 minutes
      tracker.timestamps = tracker.timestamps.filter((ts) => now - ts < 600_000);
      if (tracker.timestamps.length === 0) {
        trackerStore.delete(key);
      }
    }
  }, 60_000);
}

/**
 * Checks and records an attempt against a sliding window rate limit.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let tracker = trackerStore.get(key);
  if (!tracker) {
    tracker = { timestamps: [] };
    trackerStore.set(key, tracker);
  }

  // Keep only timestamps within the current sliding window
  tracker.timestamps = tracker.timestamps.filter((ts) => ts > windowStart);

  if (tracker.timestamps.length >= options.max) {
    const oldest = tracker.timestamps[0] || now;
    const reset = oldest + options.windowMs;
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset,
    };
  }

  // Record this attempt
  tracker.timestamps.push(now);

  const reset = now + options.windowMs;
  return {
    success: true,
    limit: options.max,
    remaining: options.max - tracker.timestamps.length,
    reset,
  };
}

/**
 * Extracts the real client IP from incoming request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return "127.0.0.1";
}
