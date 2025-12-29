import { redis, getNow, PasteData } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Change this to Promise
) {
  const { id } = await params; // Await the params here
  const data = (await redis.hgetall(`paste:${id}`)) as unknown as PasteData;

  if (!data || !data.content) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const now = getNow(req.headers);

  // Expiry check
  if (data.expires_at && now > data.expires_at) {
    await redis.del(`paste:${id}`);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // View limit check
  if (data.max_views && data.current_views >= data.max_views) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // Atomically increment views
  const newViews = await redis.hincrby(`paste:${id}`, "current_views", 1);

  return NextResponse.json({
    content: data.content,
    remaining_views: data.max_views ? data.max_views - newViews : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
  });
}