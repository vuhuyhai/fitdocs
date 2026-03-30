import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { and, eq, ilike, desc, count } from 'drizzle-orm';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('q');

    // Build filters
    const filters = [eq(documents.isPublished, true)];

    if (categorySlug && categorySlug !== 'tat-ca') {
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (cat[0]) filters.push(eq(documents.categoryId, cat[0].id));
    }

    if (search) {
      filters.push(ilike(documents.title, `%${search}%`));
    }

    const where = and(...filters);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: documents.id,
          title: documents.title,
          description: documents.description,
          fileType: documents.fileType,
          thumbnailKey: documents.thumbnailKey,
          viewCount: documents.viewCount,
          shareCount: documents.shareCount,
          fileSize: documents.fileSize,
          duration: documents.duration,
          videoUrl: documents.videoUrl,
          videoSource: documents.videoSource,
          createdAt: documents.createdAt,
          categoryId: documents.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(documents)
        .leftJoin(categories, eq(documents.categoryId, categories.id))
        .where(where)
        .orderBy(desc(documents.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db
        .select({ total: count() })
        .from(documents)
        .where(where),
    ]);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error('[GET /api/documents]', error);
    return NextResponse.json({ error: 'Không thể tải tài liệu' }, { status: 500 });
  }
}
