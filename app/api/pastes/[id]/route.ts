import { redis, getNow, PasteData } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const data = await redis.hgetall(`paste:${params.id}`) as unknown as PasteData;
  if (!data || !data.content) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const now = getNow(req.headers);
  if ((data.expires_at && now > data.expires_at) || (data.max_views && data.current_views >= data.max_views)) {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }

  const newViews = await redis.hincrby(`paste:${params.id}`, "current_views", 1);
  return NextResponse.json({
    content: data.content,
    remaining_views: data.max_views ? data.max_views - newViews : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
  });
}