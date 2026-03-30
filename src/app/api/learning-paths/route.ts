import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { learningPaths } from '@/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        coverKey: learningPaths.coverKey,
        difficulty: learningPaths.difficulty,
        estimatedDays: learningPaths.estimatedDays,
        sortOrder: learningPaths.sortOrder,
        createdAt: learningPaths.createdAt,
        stepCount: sql<number>`(SELECT count(*) FROM path_steps WHERE path_id = ${learningPaths.id})`.as('step_count'),
        enrollCount: sql<number>`(SELECT count(*) FROM path_enrollments WHERE path_id = ${learningPaths.id})`.as('enroll_count'),
      })
      .from(learningPaths)
      .where(eq(learningPaths.isPublished, true))
      .orderBy(asc(learningPaths.sortOrder), desc(learningPaths.createdAt));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/learning-paths]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
