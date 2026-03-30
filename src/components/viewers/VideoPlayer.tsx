'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  documentId: number;
}

export default function VideoPlayer({ documentId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/view-url`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json() as Promise<{ url: string }>;
      })
      .then(({ url }) => setVideoUrl(url))
      .catch(() => setError(true));
  }, [documentId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center text-red-400 text-sm">
        Không thể tải video
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center gap-2 text-zinc-500 text-sm">
        <span className="animate-spin">⏳</span> Đang tải video...
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-zinc-800 overflow-hidden bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Watermark overlay */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10"
          aria-hidden
          style={{ userSelect: 'none' }}
        >
          <span
            className="text-white font-bold"
            style={{ fontSize: '48px', transform: 'rotate(-30deg)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            FitDocs
          </span>
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full aspect-video"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
        />
      </div>

      <div className="px-4 py-2 text-center text-xs text-zinc-600 bg-zinc-900 border-t border-zinc-800">
        Video được bảo vệ bởi FitDocs — Không tải về
      </div>
    </div>
  );
}
