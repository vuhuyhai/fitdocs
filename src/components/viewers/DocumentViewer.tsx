'use client';

import dynamic from 'next/dynamic';
import {
  PdfViewerSkeleton,
  VideoPlayerSkeleton,
  VideoEmbedSkeleton,
  ArticleViewerSkeleton,
} from '@/components/ui/Skeleton';

const PdfViewer = dynamic(() => import('./PdfViewer'), {
  ssr: false,
  loading: () => <PdfViewerSkeleton />,
});

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  ssr: false,
  loading: () => <VideoPlayerSkeleton />,
});

const VideoEmbed = dynamic(() => import('./VideoEmbed'), {
  ssr: false,
  loading: () => <VideoEmbedSkeleton />,
});

const ArticleViewer = dynamic(() => import('./ArticleViewer'), {
  ssr: false,
  loading: () => <ArticleViewerSkeleton />,
});

interface DocumentViewerProps {
  documentId: number;
  fileType: string;
  title: string;
  videoSource?: string | null;
}

export default function DocumentViewer({ documentId, fileType, title, videoSource }: DocumentViewerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-green-400 text-sm font-medium">🔓 Da mo khoa</span>
        <span className="text-zinc-600 text-xs">--</span>
        <span className="text-zinc-500 text-xs">{title}</span>
      </div>

      {fileType === 'pdf' && <PdfViewer documentId={documentId} />}
      {fileType === 'video' && videoSource === 'link' && <VideoEmbed documentId={documentId} />}
      {fileType === 'video' && videoSource !== 'link' && <VideoPlayer documentId={documentId} />}
      {fileType === 'article' && <ArticleViewer documentId={documentId} />}

      {/* Legacy fallback for docx or unknown types */}
      {!['pdf', 'video', 'article'].includes(fileType) && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500 text-sm">
          Dinh dang khong duoc ho tro
        </div>
      )}
    </div>
  );
}
