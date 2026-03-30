import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';
import UploadForm from '@/components/admin/UploadForm';

export const metadata: Metadata = { title: 'Tải lên tài liệu — Admin' };

export default async function UploadPage() {
  const cats = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(categories.name);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Tải lên tài liệu</h1>
        <p className="text-zinc-500 text-sm mt-1">Tải lên tài liệu mới và lưu metadata vào database</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <UploadForm categories={cats} />
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400/80">
        <p className="font-medium text-amber-400 mb-1">⚠️ Lưu ý</p>
        <p>Upload lên S3 yêu cầu cấu hình <code className="bg-zinc-800 px-1 rounded text-xs">AWS_ACCESS_KEY_ID</code> và <code className="bg-zinc-800 px-1 rounded text-xs">AWS_SECRET_ACCESS_KEY</code> trong <code className="bg-zinc-800 px-1 rounded text-xs">.env.local</code>.</p>
      </div>
    </div>
  );
}
