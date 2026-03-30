interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden" aria-hidden="true">
      <div className="skeleton-shimmer h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-5 w-12 rounded-full" />
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
        <div className="flex justify-between pt-1">
          <div className="skeleton-shimmer h-3 w-20 rounded" />
          <div className="skeleton-shimmer h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PdfViewerSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden" aria-hidden="true">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
        <div className="skeleton-shimmer h-7 w-24 rounded" />
        <div className="w-px h-4 bg-zinc-700" />
        <div className="skeleton-shimmer h-7 w-20 rounded" />
        <div className="flex-1" />
        <div className="skeleton-shimmer h-7 w-8 rounded" />
      </div>
      {/* Progress bar slot */}
      <div className="h-0.5 bg-zinc-800" />
      {/* Page area */}
      <div className="flex justify-center py-8 bg-zinc-950 min-h-[500px]">
        <div className="skeleton-shimmer w-[595px] max-w-full" style={{ height: '842px' }} />
      </div>
    </div>
  );
}

export function DocxViewerSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8" aria-hidden="true">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton-shimmer h-8 w-2/3 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        <div className="skeleton-shimmer h-6 w-1/2 rounded mt-6" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-6 w-1/3 rounded mt-6" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function ArticleViewerSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8" aria-hidden="true">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton-shimmer h-6 w-2/3 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function VideoEmbedSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden" aria-hidden="true">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <div className="skeleton-shimmer absolute inset-0 rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="skeleton-shimmer w-16 h-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function VideoPlayerSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden" aria-hidden="true">
      {/* 16:9 video area */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <div className="skeleton-shimmer absolute inset-0 rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="skeleton-shimmer w-16 h-16 rounded-full" />
        </div>
      </div>
      {/* Controls bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-t border-zinc-800">
        <div className="skeleton-shimmer h-6 w-6 rounded-full" />
        <div className="skeleton-shimmer h-2 flex-1 rounded-full" />
        <div className="skeleton-shimmer h-5 w-16 rounded" />
        <div className="skeleton-shimmer h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}
