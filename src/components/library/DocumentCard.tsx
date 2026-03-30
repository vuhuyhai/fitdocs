'use client';

import Link from 'next/link';
import Badge, { FileTypeBadge } from '@/components/ui/Badge';
import { getVideoThumbnailUrl, getVideoDomain } from '@/lib/video-url';

interface DocumentCardProps {
  id: number;
  title: string;
  description: string | null;
  fileType: string;
  thumbnailKey: string | null;
  viewCount: number;
  shareCount: number;
  categoryName: string | null;
  categorySlug: string | null;
  videoUrl?: string | null;
  videoSource?: string | null;
  duration?: number | null;
  fileSize?: number | null;
}

function ThumbnailPlaceholder({ fileType }: { fileType: string }) {
  const icons: Record<string, string> = { pdf: '📄', video: '🎬', article: '📝' };
  const colors: Record<string, string> = {
    pdf: 'from-red-900/30 to-red-950',
    video: 'from-blue-900/30 to-blue-950',
    article: 'from-orange-900/30 to-orange-950',
  };
  return (
    <div
      className={`h-44 flex items-center justify-center bg-gradient-to-b ${colors[fileType] ?? 'from-zinc-800 to-zinc-900'}`}
    >
      <span className="text-5xl opacity-60">{icons[fileType] ?? '📄'}</span>
    </div>
  );
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function MetaLine({ fileType, videoSource, videoUrl, duration, fileSize }: {
  fileType: string;
  videoSource?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  fileSize?: number | null;
}) {
  const parts: string[] = [];

  if (fileType === 'video' && videoSource === 'link' && videoUrl) {
    parts.push(getVideoDomain(videoUrl));
    if (duration) parts.push(formatDuration(duration));
  } else if (fileType === 'video') {
    if (duration) parts.push(formatDuration(duration));
    if (fileSize) parts.push(formatSize(fileSize));
  }

  if (!parts.length) return null;
  return <span className="text-xs text-zinc-500">{parts.join(' · ')}</span>;
}

export default function DocumentCard({
  id, title, description, fileType, thumbnailKey,
  viewCount, shareCount, categoryName,
  videoUrl, videoSource, duration, fileSize,
}: DocumentCardProps) {
  // Auto-thumbnail for video links
  let thumbnailSrc: string | null = null;
  if (thumbnailKey) {
    thumbnailSrc = `/api/thumb/${encodeURIComponent(thumbnailKey)}`;
  } else if (fileType === 'video' && videoSource === 'link' && videoUrl) {
    thumbnailSrc = getVideoThumbnailUrl(videoUrl);
  }

  return (
    <Link
      href={`/tai-lieu/${id}`}
      className="group card-hover flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-violet-500/50 hover:bg-zinc-800/50"
    >
      {/* Thumbnail */}
      <div className="overflow-hidden">
        {thumbnailSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailSrc}
            alt={title}
            className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={thumbnailSrc ? 'hidden' : ''}>
          <ThumbnailPlaceholder fileType={fileType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex flex-wrap gap-1.5">
          <FileTypeBadge type={fileType} videoSource={videoSource ?? undefined} />
          {categoryName && <Badge variant="category">{categoryName}</Badge>}
        </div>

        <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 group-hover:text-violet-300 transition-colors">
          {title}
        </h3>

        <MetaLine
          fileType={fileType}
          videoSource={videoSource}
          videoUrl={videoUrl}
          duration={duration}
          fileSize={fileSize}
        />

        {description && (
          <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{description}</p>
        )}

        <div className="flex items-center justify-between pt-1 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <span>👁</span> {viewCount.toLocaleString('vi-VN')} luot xem
          </span>
          <span className="flex items-center gap-1">
            <span>🔗</span> {shareCount.toLocaleString('vi-VN')} chia se
          </span>
        </div>
      </div>
    </Link>
  );
}
