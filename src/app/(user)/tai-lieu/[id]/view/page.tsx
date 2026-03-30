import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { db } from '@/lib/db';
import { documents, categories, unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { ANON_COOKIE } from '@/lib/anonymous-user';
import DocumentViewer from '@/components/viewers/DocumentViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getDocumentWithUnlock = cache(async function getDocumentWithUnlock(docId: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(ANON_COOKIE)?.value;

  const [doc] = await db
    .select({
      id: documents.id,
      title: documents.title,
      fileType: documents.fileType,
      videoSource: documents.videoSource,
      isPublished: documents.isPublished,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(documents)
    .leftJoin(categories, eq(documents.categoryId, categories.id))
    .where(and(eq(documents.id, docId), eq(documents.isPublished, true)))
    .limit(1);

  if (!doc) return null;

  let isUnlocked = false;
  if (userId) {
    const [token] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(and(eq(unlockTokens.userId, userId), eq(unlockTokens.documentId, docId)))
      .limit(1);
    isUnlocked = !!token;
  }

  return { ...doc, isUnlocked };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocumentWithUnlock(Number(id));
  if (!doc) return { title: 'Không tìm thấy' };
  return { title: `${doc.title} — Xem tài liệu` };
}

export default async function ViewPage({ params }: PageProps) {
  const { id } = await params;
  const docId = Number(id);
  if (isNaN(docId)) notFound();

  const doc = await getDocumentWithUnlock(docId);
  if (!doc) notFound();

  // Redirect to detail page if not unlocked
  if (!doc.isUnlocked) {
    redirect(`/tai-lieu/${docId}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/thu-vien" className="hover:text-zinc-300 transition-colors">Thư viện</Link>
        {doc.categoryName && (
          <>
            <span>/</span>
            <Link href={`/thu-vien?category=${doc.categorySlug}`} className="hover:text-zinc-300 transition-colors">
              {doc.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <Link href={`/tai-lieu/${docId}`} className="hover:text-zinc-300 transition-colors truncate max-w-[150px]">
          {doc.title}
        </Link>
        <span>/</span>
        <span className="text-zinc-400">Xem</span>
      </nav>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-50 mb-6 leading-snug">{doc.title}</h1>

      {/* Viewer */}
      <DocumentViewer
        documentId={doc.id}
        fileType={doc.fileType}
        title={doc.title}
        videoSource={doc.videoSource}
      />

      {/* Back link */}
      <div className="mt-6">
        <Link
          href={`/tai-lieu/${docId}`}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Quay lại thông tin tài liệu
        </Link>
      </div>
    </div>
  );
}
