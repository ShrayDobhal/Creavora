// Memory-based lightweight rate limiter middleware for Next.js App Router API endpoints
const tracker = new Map();

/**
 * Basic rate limiting helper.
 *
 * @param {string} ip - Client IP address
 * @param {number} limit - Maximum requests allowed in window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {boolean} True if allowed, False if rate-limited
 */
export function isAllowed(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const clientKey = `${ip}`;

  if (!tracker.has(clientKey)) {
    tracker.set(clientKey, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = tracker.get(clientKey);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  record.count += 1;
  return record.count <= limit;
}
