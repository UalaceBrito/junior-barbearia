import "server-only";

import type { NextRequest } from "next/server";

// Rate limit em memória por instância (defesa em profundidade; o limite por
// telefone no banco continua sendo a barreira consistente).
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || request.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export function isRateLimited(request: NextRequest, scope: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5_000) {
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
    if (buckets.size > 5_000) buckets.clear();
  }
  const key = `${scope}:${clientIp(request)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
