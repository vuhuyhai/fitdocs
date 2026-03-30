'use client';

import { useEffect, useState } from 'react';

interface VideoEmbedProps {
  documentId: number;
}

export default function VideoEmbed({ documentId }: VideoEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/view-url`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json() as Promise<{ url: string; source: string }>;
      })
      .then(({ url }) => setEmbedUrl(url))
      .catch(() => setError(true));
  }, [documentId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center text-red-400 text-sm">
        Khong the tai video
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center gap-2 text-zinc-500 text-sm">
        <span className="animate-spin">⏳</span> Dang tai video...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden bg-black">
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          style={{ border: 0 }}
        />
      </div>
      <div className="px-4 py-2 text-center text-xs text-zinc-600 bg-zinc-900 border-t border-zinc-800">
        Video duoc chia se tu nguon ngoai
      </div>
    </div>
  );
}
