import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sortBy = request.nextUrl.searchParams.get('sort') ?? 'views';
    const limit = Math.min(50, Number(request.nextUrl.searchParams.get('limit') ?? '10'));

    const orderCol =
      sortBy === 'shares' ? documents.shareCount :
      sortBy === 'unlocks' ? documents.viewCount :
      documents.viewCount;

    const rows = await db
      .select({
        id: documents.id,
        title: documents.title,
        fileType: documents.fileType,
        viewCount: documents.viewCount,
        shareCount: documents.shareCount,
        createdAt: documents.createdAt,
        categoryName: categories.name,
      })
      .from(documents)
      .leftJoin(categories, eq(documents.categoryId, categories.id))
      .orderBy(desc(orderCol))
      .limit(limit);

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/admin/analytics/top-docs]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
