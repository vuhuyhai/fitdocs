'use client';

import { useEffect, useState } from 'react';

interface ArticleViewerProps {
  documentId: number;
}

export default function ArticleViewer({ documentId }: ArticleViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json() as Promise<{ data: { content?: string } }>;
      })
      .then(({ data }) => setContent(data.content ?? ''))
      .catch(() => setError(true));
  }, [documentId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center text-red-400 text-sm">
        Khong the tai bai viet
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 flex items-center justify-center gap-2 text-zinc-500 text-sm">
        <span className="animate-spin">⏳</span> Dang tai...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Watermark */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.04]"
          aria-hidden
          style={{ userSelect: 'none' }}
        >
          <span
            className="text-white font-bold"
            style={{ fontSize: '64px', transform: 'rotate(-30deg)' }}
          >
            FitDocs
          </span>
        </div>

        <article
          className="prose prose-invert prose-zinc max-w-none p-6 sm:p-8"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {content}
        </article>
      </div>

      <div className="px-4 py-2 text-center text-xs text-zinc-600 bg-zinc-950 border-t border-zinc-800">
        Bai viet duoc bao ve boi FitDocs
      </div>
    </div>
  );
}
