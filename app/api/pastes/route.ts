import { redis, getNow } from '@/lib/redis';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().min(1).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json(result.error, { status: 400 });

  const id = nanoid(8);
  const now = getNow(req.headers);
  const { content, ttl_seconds, max_views } = result.data;

  const paste = {
    content,
    max_views: max_views || null,
    current_views: 0,
    expires_at: ttl_seconds ? now + (ttl_seconds * 1000) : null,
  };

  await redis.hset(`paste:${id}`, paste);
  const host = req.headers.get('host');
  return NextResponse.json({ 
    id, 
    url: `https://${host}/p/${id}` 
  });
}