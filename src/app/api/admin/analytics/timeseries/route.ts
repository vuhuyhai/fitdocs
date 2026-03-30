import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shareEvents } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const groupBy = request.nextUrl.searchParams.get('group') ?? 'day';
    const limit = Math.min(90, Number(request.nextUrl.searchParams.get('limit') ?? '30'));

    let dateExpr: ReturnType<typeof sql>;
    if (groupBy === 'week') {
      dateExpr = sql`to_char(${shareEvents.createdAt}, 'IYYY-IW')`;
    } else if (groupBy === 'month') {
      dateExpr = sql`to_char(${shareEvents.createdAt}, 'YYYY-MM')`;
    } else {
      dateExpr = sql`to_char(${shareEvents.createdAt}, 'YYYY-MM-DD')`;
    }

    const rows = await db
      .select({
        date: dateExpr.as('date'),
        shares: sql<number>`count(*)`.as('shares'),
        members: sql<number>`count(distinct ${shareEvents.userId})`.as('members'),
      })
      .from(shareEvents)
      .groupBy(dateExpr)
      .orderBy(desc(dateExpr))
      .limit(limit);

    // Reverse to get chronological order
    rows.reverse();

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/admin/analytics/timeseries]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
