import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, shareEvents, unlockTokens } from '@/db/schema';
import { count, sum, eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [
      [{ totalDocs }],
      [{ publishedDocs }],
      [{ totalShares }],
      [{ totalUnlocks }],
      [{ totalViews }],
    ] = await Promise.all([
      db.select({ totalDocs: count() }).from(documents),
      db.select({ publishedDocs: count() }).from(documents).where(eq(documents.isPublished, true)),
      db.select({ totalShares: count() }).from(shareEvents),
      db.select({ totalUnlocks: count() }).from(unlockTokens),
      db.select({ totalViews: sum(documents.viewCount) }).from(documents),
    ]);

    return NextResponse.json({
      data: {
        totalDocs: Number(totalDocs),
        publishedDocs: Number(publishedDocs),
        totalShares: Number(totalShares),
        totalUnlocks: Number(totalUnlocks),
        totalViews: Number(totalViews ?? 0),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/stats]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
