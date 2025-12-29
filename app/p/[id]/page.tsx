import { redis, getNow, PasteData } from '@/lib/redis';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await redis.hgetall(`paste:${id}`) as unknown as PasteData;
  const now = getNow(await headers());

  if (!data || !data.content) notFound();
  
  // Expiry check
  if (data.expires_at && now > data.expires_at) notFound();
  
  // View limit check
  if (data.max_views && data.current_views >= data.max_views) notFound();

  return (
    <main className="p-10">
      <div className="max-w-4xl mx-auto">
        <pre className="p-6 bg-gray-50 border rounded whitespace-pre-wrap font-mono text-black">
          {data.content}
        </pre>
      </div>
    </main>
  );
}