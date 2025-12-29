import { redis, getNow, PasteData } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id } = await params; 
  
  // 1. Increment first to get the most accurate current count
  // This is atomic - no two users can get the same "newViews" number
  const newViews = await redis.hincrby(`paste:${id}`, "current_views", 1);

  // 2. Now fetch the rest of the data
  const data = (await redis.hgetall(`paste:${id}`)) as unknown as PasteData;

  if (!data || !data.content) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const now = getNow(req.headers);

  // 3. Expiry check
  if (data.expires_at && now > data.expires_at) {
    await redis.del(`paste:${id}`);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // 4. View limit check (Compare against the incremented value)
  // If max_views is 2, and newViews is now 3, we block it.
  if (data.max_views && newViews > data.max_views) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({
    content: data.content,
    remaining_views: data.max_views ? Math.max(0, data.max_views - newViews) : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
  });
}