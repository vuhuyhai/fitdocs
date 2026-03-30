import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cache } from 'react';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { FileTypeBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import ShareModal from '@/components/library/ShareModal';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getDocument = cache(async function getDocument(id: number) {
  const [row] = await db
    .select({
      id: documents.id,
      title: documents.title,
      description: documents.description,
      fileType: documents.fileType,
      fileKey: documents.fileKey,
      thumbnailKey: documents.thumbnailKey,
      fileSize: documents.fileSize,
      duration: documents.duration,
      videoUrl: documents.videoUrl,
      videoSource: documents.videoSource,
      viewCount: documents.viewCount,
      shareCount: documents.shareCount,
      createdAt: documents.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(documents)
    .leftJoin(categories, eq(documents.categoryId, categories.id))
    .where(and(eq(documents.id, id), eq(documents.isPublished, true)))
    .limit(1);

  if (row) {
    // Increment view count (fire and forget)
    db.update(documents)
      .set({ viewCount: sql`${documents.viewCount} + 1` })
      .where(eq(documents.id, id))
      .catch(console.error);
  }

  return row ?? null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocument(Number(id));
  if (!doc) return { title: 'Không tìm thấy' };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const pageUrl = `${baseUrl}/tai-lieu/${id}`;
  const ogImages = doc.thumbnailKey
    ? [{ url: `${baseUrl}/api/thumb/${encodeURIComponent(doc.thumbnailKey)}` }]
    : [];
  return {
    title: doc.title,
    description: doc.description ?? 'Tài liệu Fitness — FitDocs',
    openGraph: {
      title: doc.title,
      description: doc.description ?? 'Tài liệu Fitness — FitDocs',
      type: 'article',
      url: pageUrl,
      images: ogImages,
      siteName: 'FitDocs',
    },
  };
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} phút`;
}


export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const docId = Number(id);
  if (isNaN(docId)) notFound();

  const doc = await getDocument(docId);
  if (!doc) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/thu-vien" className="hover:text-zinc-300 transition-colors">Thư viện</Link>
        {doc.categoryName && (
          <>
            <span>/</span>
            <Link
              href={`/thu-vien?category=${doc.categorySlug}`}
              className="hover:text-zinc-300 transition-colors"
            >
              {doc.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{doc.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Title */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <FileTypeBadge type={doc.fileType} />
              {doc.categoryName && <Badge variant="category">{doc.categoryName}</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 leading-snug">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-zinc-400 leading-relaxed">{doc.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-zinc-500 border-t border-zinc-800 pt-4">
            <span>👁 {doc.viewCount.toLocaleString('vi-VN')} lượt xem</span>
            <span>🔗 {doc.shareCount.toLocaleString('vi-VN')} chia sẻ</span>
          </div>

          {/* Share-to-Unlock CTA */}
          <ShareModal
            documentId={doc.id}
            documentTitle={doc.title}
            fileType={doc.fileType}
            shareUrl={`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/tai-lieu/${doc.id}?utm_source=facebook&utm_medium=share&utm_campaign=share_to_unlock`}
          />
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-200 text-sm">Thông tin tài liệu</h3>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Loại file</dt>
                <dd className="text-zinc-300">{FILE_TYPE_LABELS[doc.fileType]}</dd>
              </div>
              {doc.fileSize && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Dung lượng</dt>
                  <dd className="text-zinc-300">{formatFileSize(doc.fileSize)}</dd>
                </div>
              )}
              {doc.fileType === 'video' && doc.duration && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Thoi luong</dt>
                  <dd className="text-zinc-300">{formatDuration(doc.duration)}</dd>
                </div>
              )}
              {doc.fileType === 'video' && doc.videoSource === 'link' && doc.videoUrl && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Nguon</dt>
                  <dd className="text-zinc-300">Video link</dd>
                </div>
              )}
              {doc.categoryName && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Danh mục</dt>
                  <dd className="text-zinc-300">{doc.categoryName}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500">Ngày đăng</dt>
                <dd className="text-zinc-300">
                  {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-200 text-sm">Cách thức hoạt động</h3>
            <ol className="flex flex-col gap-2 text-sm text-zinc-400">
              {[
                'Nhấn nút "Chia sẻ lên Facebook"',
                'Chia sẻ link tài liệu này',
                'Tài liệu tự động mở khóa',
                'Xem lại bất cứ lúc nào',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
