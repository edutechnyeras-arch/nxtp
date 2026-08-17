import { NextRequest } from "next/server"

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Periodic cleanup of stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return
  }
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, record] of rateLimitMap.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => ts > cutoff)
    if (validTimestamps.length === 0) {
      rateLimitMap.delete(key)
    } else {
      record.timestamps = validTimestamps
    }
  }
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Checks if a given key (e.g. IP address) has exceeded the rate limit.
 *
 * @param key Unique identifier for the client (e.g. IP address)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Time window in milliseconds (default: 60,000ms / 1 min)
 */
export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60 * 1000
): RateLimitResult {
  cleanupStaleEntries(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs

  let record = rateLimitMap.get(key)
  if (!record) {
    record = { timestamps: [] }
    rateLimitMap.set(key, record)
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff)

  const remaining = Math.max(0, limit - record.timestamps.length)
  const reset = Math.ceil(
    (record.timestamps.length > 0 ? record.timestamps[0] + windowMs - now : windowMs) / 1000
  )

  if (record.timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(1, reset),
    }
  }

  record.timestamps.push(now)
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.max(1, reset),
  }
}

/**
 * Extracts client IP address from Next.js request headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const ips = forwardedFor.split(",")
    return ips[0].trim()
  }

  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  const cfIp = req.headers.get("cf-connecting-ip")
  if (cfIp) {
    return cfIp.trim()
  }

  return "127.0.0.1"
}
