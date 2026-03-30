import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shareEvents, documents, anonymousUsers } from '@/db/schema';
import { eq, sql, desc, count } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? '1'));
    const pageSize = 20;

    // Get members grouped by userId with aggregated stats
    const members = await db
      .select({
        userId: shareEvents.userId,
        totalShares: sql<number>`count(*)`.as('total_shares'),
        unlockedDocs: sql<number>`count(distinct ${shareEvents.documentId})`.as('unlocked_docs'),
        firstSharedAt: sql<string>`min(${shareEvents.createdAt})`.as('first_shared_at'),
        lastSharedAt: sql<string>`max(${shareEvents.createdAt})`.as('last_shared_at'),
      })
      .from(shareEvents)
      .where(sql`${shareEvents.userId} IS NOT NULL`)
      .groupBy(shareEvents.userId)
      .orderBy(desc(sql`max(${shareEvents.createdAt})`))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Total count
    const [{ total }] = await db
      .select({ total: sql<number>`count(distinct ${shareEvents.userId})` })
      .from(shareEvents)
      .where(sql`${shareEvents.userId} IS NOT NULL`);

    return NextResponse.json({
      data: members,
      pagination: {
        page,
        pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pageSize),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/members]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
