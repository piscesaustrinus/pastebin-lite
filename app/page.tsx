"use client";
import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState<number | ''>('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });
      
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      } else {
        alert("Error creating paste. Check console.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">New Paste</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              required
              className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Paste your code or text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TTL (Seconds)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                placeholder="Optional"
                value={ttl}
                onChange={(e) => setTtl(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Views</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                placeholder="Optional"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </form>

        {url && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium mb-2">Paste Created Successfully!</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 p-2 bg-white border border-green-300 rounded text-sm text-black"
              />
              <button 
                onClick={() => window.open(url, '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Open
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}