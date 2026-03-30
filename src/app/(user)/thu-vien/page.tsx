import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';
import DocumentCard from '@/components/library/DocumentCard';
import CategoryTabs from '@/components/library/CategoryTabs';
import SearchBar from '@/components/library/SearchBar';
import EmptyState from '@/components/library/EmptyState';
import { DocumentCardSkeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = { title: 'Thư viện' };

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

async function getDocuments(category?: string, q?: string, page = 1) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  params.set('page', String(page));
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/documents?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải tài liệu');
  return res.json() as Promise<{
    data: {
      id: number;
      title: string;
      description: string | null;
      fileType: string;
      thumbnailKey: string | null;
      viewCount: number;
      shareCount: number;
      fileSize: number | null;
      duration: number | null;
      videoUrl: string | null;
      videoSource: string | null;
      categoryName: string | null;
      categorySlug: string | null;
    }[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }>;
}

async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

async function DocGrid({
  category,
  q,
  page,
}: {
  category?: string;
  q?: string;
  page: number;
}) {
  const { data: docs, pagination } = await getDocuments(category, q, page);

  if (docs.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy tài liệu"
        description={
          q
            ? `Không có kết quả cho "${q}". Hãy thử từ khóa khác.`
            : 'Chưa có tài liệu nào trong danh mục này.'
        }
        action={{ label: 'Xem tất cả tài liệu', href: '/thu-vien' }}
      />
    );
  }

  const totalPages = pagination.totalPages;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-zinc-500">
        {pagination.total.toLocaleString('vi-VN')} tài liệu
        {q ? ` cho "${q}"` : ''}
      </p>
      <div className="list-animate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <DocumentCard key={doc.id} {...doc} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <PaginationLink page={page - 1} category={category} q={q} label="← Trước" />
          )}
          <span className="px-4 py-2 text-sm text-zinc-400">
            Trang {page} / {totalPages}
          </span>
          {page < totalPages && (
            <PaginationLink page={page + 1} category={category} q={q} label="Sau →" />
          )}
        </div>
      )}
    </div>
  );
}

function PaginationLink({
  page,
  category,
  q,
  label,
}: {
  page: number;
  category?: string;
  q?: string;
  label: string;
}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  params.set('page', String(page));
  return (
    <Link
      href={`/thu-vien?${params.toString()}`}
      className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors btn-press"
    >
      {label}
    </Link>
  );
}

function DocGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const { category, q, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? '1'));
  const activeSlug = category ?? 'tat-ca';

  const cats = await getCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 mb-1">Thư viện</h1>
        <p className="text-zinc-400">Khám phá tài liệu tập luyện và dinh dưỡng chuyên sâu</p>
      </div>

      {/* Search */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* Category tabs */}
      <Suspense>
        <CategoryTabs categories={cats} activeSlug={activeSlug} />
      </Suspense>

      {/* Document grid */}
      <Suspense fallback={<DocGridSkeleton />}>
        <DocGrid category={category} q={q} page={page} />
      </Suspense>
    </div>
  );
}
