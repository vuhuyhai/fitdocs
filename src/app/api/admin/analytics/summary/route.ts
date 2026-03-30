import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, unlockTokens, shareEvents, learningPaths, pathEnrollments } from '@/db/schema';
import { count, sum, eq, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [[docsRow], [viewsRow], [unlocksRow], [sharesRow], [membersRow], [pathsRow], [enrollRow]] = await Promise.all([
      db.select({ val: count() }).from(documents),
      db.select({ val: sql<number>`coalesce(sum(${documents.viewCount}), 0)` }).from(documents),
      db.select({ val: count() }).from(unlockTokens),
      db.select({ val: count() }).from(shareEvents),
      db.select({ val: sql<number>`count(distinct ${shareEvents.userId})` }).from(shareEvents),
      db.select({ val: count() }).from(learningPaths).where(eq(learningPaths.isPublished, true)),
      db.select({ val: count() }).from(pathEnrollments),
    ]);

    const totalDocs = Number(docsRow.val);
    const totalViews = Number(viewsRow.val);
    const totalUnlocks = Number(unlocksRow.val);
    const totalShares = Number(sharesRow.val);
    const totalMembers = Number(membersRow.val);
    const unlockRate = totalViews > 0 ? Math.round((totalUnlocks / totalViews) * 10000) / 100 : 0;

    return NextResponse.json({
      data: {
        totalDocs,
        totalViews,
        totalUnlocks,
        totalShares,
        totalMembers,
        unlockRate,
        activePaths: Number(pathsRow.val),
        pathEnrollments: Number(enrollRow.val),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/analytics/summary]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
