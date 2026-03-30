import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

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
        content: documents.content,
        viewCount: documents.viewCount,
        shareCount: documents.shareCount,
        createdAt: documents.createdAt,
        categoryId: documents.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .where(and(eq(documents.id, docId), eq(documents.isPublished, true)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: 'Không tìm thấy tài liệu' }, { status: 404 });
    }

    // Increment view count
    await db
      .update(documents)
      .set({ viewCount: sql`${documents.viewCount} + 1` })
      .where(eq(documents.id, docId));

    return NextResponse.json({ data: row });
  } catch (error) {
    console.error('[GET /api/documents/[id]]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
