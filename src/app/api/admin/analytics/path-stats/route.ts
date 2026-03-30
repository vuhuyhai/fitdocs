import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { learningPaths } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        difficulty: learningPaths.difficulty,
        isPublished: learningPaths.isPublished,
        stepCount: sql<number>`(SELECT count(*) FROM path_steps WHERE path_id = ${learningPaths.id})`.as('step_count'),
        enrollments: sql<number>`(SELECT count(*) FROM path_enrollments WHERE path_id = ${learningPaths.id})`.as('enrollments'),
      })
      .from(learningPaths)
      .orderBy(desc(learningPaths.createdAt));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/admin/analytics/path-stats]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
