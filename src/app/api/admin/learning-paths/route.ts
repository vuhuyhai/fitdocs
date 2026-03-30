import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { learningPaths, pathSteps, pathEnrollments } from '@/db/schema';
import { desc, count, eq, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const rows = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        coverKey: learningPaths.coverKey,
        difficulty: learningPaths.difficulty,
        estimatedDays: learningPaths.estimatedDays,
        isPublished: learningPaths.isPublished,
        sortOrder: learningPaths.sortOrder,
        createdAt: learningPaths.createdAt,
        updatedAt: learningPaths.updatedAt,
        stepCount: sql<number>`(SELECT count(*) FROM path_steps WHERE path_id = ${learningPaths.id})`.as('step_count'),
        enrollCount: sql<number>`(SELECT count(*) FROM path_enrollments WHERE path_id = ${learningPaths.id})`.as('enroll_count'),
      })
      .from(learningPaths)
      .orderBy(learningPaths.sortOrder, desc(learningPaths.createdAt));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/admin/learning-paths]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().default(''),
  coverKey: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedDays: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [path] = await db.insert(learningPaths).values(parsed.data).returning();
    return NextResponse.json({ data: path }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/learning-paths]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
