import { redis, getNow, PasteData } from '@/lib/redis';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Increment first to get the most accurate "current" count
  const newViews = await redis.hincrby(`paste:${id}`, "current_views", 1);

  // 2. Fetch the data
  const data = await redis.hgetall(`paste:${id}`) as unknown as PasteData;
  const now = getNow(await headers());

  if (!data || !data.content) notFound();
  
  // 3. Expiry check
  if (data.expires_at && now > data.expires_at) {
    await redis.del(`paste:${id}`); // Clean up expired data
    notFound();
  }
  
  // 4. View limit check - Compare against the incremented value
  if (data.max_views && newViews > data.max_views) {
    notFound();
  }

  return (
    <main className="p-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-mono text-gray-500 mb-4">
          Views: {newViews} {data.max_views ? `/ ${data.max_views}` : ''}
        </h2>
        <pre className="p-6 bg-gray-50 border rounded whitespace-pre-wrap font-mono text-black shadow-sm">
          {data.content}
        </pre>
      </div>
    </main>
  );
}