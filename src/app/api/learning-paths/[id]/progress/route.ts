import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { pathProgress, pathSteps } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ANON_COOKIE } from '@/lib/anonymous-user';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const completeSchema = z.object({
  docId: z.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pathId = Number(id);
    if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

    const userId = request.cookies.get(ANON_COOKIE)?.value;
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: 'Chua dang nhap' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { docId } = parsed.data;

    // Verify step exists in this path
    const [step] = await db
      .select({ id: pathSteps.id })
      .from(pathSteps)
      .where(and(eq(pathSteps.pathId, pathId), eq(pathSteps.docId, docId)))
      .limit(1);
    if (!step) return NextResponse.json({ error: 'Buoc nay khong thuoc lo trinh' }, { status: 400 });

    // Upsert progress
    await db
      .insert(pathProgress)
      .values({ pathId, userId, docId, isCompleted: true, completedAt: new Date() })
      .onConflictDoUpdate({
        target: [pathProgress.pathId, pathProgress.userId, pathProgress.docId],
        set: { isCompleted: true, completedAt: new Date() },
      });

    // Return updated progress summary
    const [summary] = await db
      .select({
        totalSteps: sql<number>`(SELECT count(*) FROM path_steps WHERE path_id = ${pathId})`,
        completedSteps: sql<number>`(SELECT count(*) FROM path_progress WHERE path_id = ${pathId} AND user_id = ${userId}::uuid AND is_completed = true)`,
      })
      .from(sql`(SELECT 1) as dummy`);

    const total = Number(summary.totalSteps);
    const completed = Number(summary.completedSteps);

    return NextResponse.json({
      data: {
        totalSteps: total,
        completedSteps: completed,
        percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
        isFinished: total > 0 && completed === total,
      },
    });
  } catch (error) {
    console.error('[POST /api/learning-paths/[id]/progress]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
