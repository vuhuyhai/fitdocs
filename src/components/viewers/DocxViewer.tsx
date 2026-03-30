'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface DocxViewerProps {
  documentId: number;
}

export default function DocxViewer({ documentId }: DocxViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/render`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json() as Promise<{ html: string }>;
      })
      .then(({ html }) => setHtml(html))
      .catch(() => setError(true));
  }, [documentId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center text-red-400 text-sm">
        Không thể tải nội dung tài liệu
      </div>
    );
  }

  if (!html) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 flex items-center justify-center gap-2 text-zinc-500 text-sm">
        <span className="animate-spin">⏳</span> Đang chuyển đổi tài liệu...
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl border border-zinc-800 bg-white overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
          e.preventDefault();
        }
      }}
    >
      {/* Watermark overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.04]"
        aria-hidden
        style={{ userSelect: 'none' }}
      >
        <span
          className="text-gray-900 font-bold whitespace-nowrap"
          style={{ fontSize: '80px', transform: 'rotate(-30deg)' }}
        >
          FitDocs
        </span>
      </div>

      {/* DOCX HTML content */}
      <div
        className="docx-viewer p-8 max-w-none overflow-auto max-h-[70vh]"
        style={{ fontFamily: 'Georgia, serif', color: '#111', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />

      <div className="px-4 py-2 text-center text-xs text-zinc-400 bg-zinc-100 border-t border-zinc-200">
        Tài liệu được bảo vệ bởi FitDocs — Không sao chép hoặc tải về
      </div>
    </div>
  );
}
