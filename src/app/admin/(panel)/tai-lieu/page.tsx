import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';
import DocumentTable from '@/components/admin/DocumentTable';

export const metadata: Metadata = { title: 'Quản lý tài liệu — Admin' };

interface DocRow {
  id: number;
  title: string;
  fileType: string;
  isPublished: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  categoryName: string | null;
}

async function getDocs(page: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/documents?page=${page}`, {
    cache: 'no-store',
    headers: { Cookie: `${COOKIE_NAME}=${token}` },
  });
  if (!res.ok) return { data: [] as DocRow[], pagination: { total: 0, page: 1, pageSize: 20 } };
  return res.json() as Promise<{ data: DocRow[]; pagination: { total: number; page: number; pageSize: number } }>;
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ManageDocsPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? '1'));
  const { data: docs, pagination } = await getDocs(page);
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Tài liệu</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {pagination.total.toLocaleString('vi-VN')} tài liệu trong hệ thống
          </p>
        </div>
        <Link href="/admin/upload" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">
          ⬆️ Tải lên mới
        </Link>
      </div>

      <DocumentTable docs={docs} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/tai-lieu?page=${page - 1}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
              ← Trước
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-zinc-400">Trang {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/tai-lieu?page=${page + 1}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
              Sau →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
