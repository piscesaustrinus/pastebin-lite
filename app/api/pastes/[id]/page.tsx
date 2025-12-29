import { redis, getNow, PasteData } from '@/lib/redis';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Page({ params }: { params: { id: string } }) {
  const data = await redis.hgetall(`paste:${params.id}`) as unknown as PasteData;
  const now = getNow(headers());

  if (!data || !data.content) notFound();
  if (data.expires_at && now > data.expires_at) notFound();
  if (data.max_views && data.current_views >= data.max_views) notFound();

  return (
    <main className="p-10">
      <pre className="p-6 bg-gray-50 border rounded whitespace-pre-wrap font-mono">
        {data.content}
      </pre>
    </main>
  );
}