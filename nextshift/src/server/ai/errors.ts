export class AiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function clientError(error: unknown) {
  if (error instanceof AiError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status, headers: noStore() });
  }
  console.error('[ai] request failed');
  return Response.json(
    { error: 'The career coach is unavailable right now.', code: 'unavailable' },
    { status: 502, headers: noStore() },
  );
}

export function noStore() {
  return { 'Cache-Control': 'no-store' };
}

const hits = new Map<string, number[]>();

export function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'local';
}

export function assertRate(request: Request, bucket: string, limit = 24, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const key = `${bucket}:${clientKey(request)}`;
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    throw new AiError(429, 'rate_limited', 'Too many requests. Wait a moment and try again.');
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [name, stamps] of hits) {
      if (stamps.every((stamp) => now - stamp >= windowMs)) hits.delete(name);
    }
  }
}
