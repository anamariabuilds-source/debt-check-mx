import { createHash, timingSafeEqual } from "node:crypto";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1_000;
const MAX_REQUESTS = 6;

export function hasDemoAccess(provided: string | null, configured = process.env.AI_DEMO_ACCESS_TOKEN): boolean {
  if (!configured || !provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}
export function takeRateLimit(key: string, now = Date.now()): boolean {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

export function resetRateLimitsForTests(): void { buckets.clear(); }
