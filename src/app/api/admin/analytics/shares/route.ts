import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shareEvents, documents } from '@/db/schema';
import { count, desc, eq, gte, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';
import { MAX_ANALYTICS_DAYS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(Number(searchParams.get('days') ?? '7'), MAX_ANALYTICS_DAYS);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Top 10 documents by share count
    const topDocuments = await db
      .select({
        documentId: shareEvents.documentId,
        title: documents.title,
        shares: count(),
      })
      .from(shareEvents)
      .leftJoin(documents, eq(shareEvents.documentId, documents.id))
      .groupBy(shareEvents.documentId, documents.title)
      .orderBy(desc(count()))
      .limit(10);

    // Daily share counts for the last N days (PostgreSQL date cast syntax)
    const dailyShares = await db
      .select({
        date: sql<string>`${shareEvents.createdAt}::date`.as('date'),
        shares: count(),
      })
      .from(shareEvents)
      .where(gte(shareEvents.createdAt, since))
      .groupBy(sql`${shareEvents.createdAt}::date`)
      .orderBy(sql`${shareEvents.createdAt}::date`);

    return NextResponse.json({ data: { topDocuments, dailyShares } });
  } catch (error) {
    console.error('[GET /api/admin/analytics/shares]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
