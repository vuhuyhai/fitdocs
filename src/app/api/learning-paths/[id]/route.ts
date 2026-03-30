import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { learningPaths, pathSteps, pathProgress, documents } from '@/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { ANON_COOKIE } from '@/lib/anonymous-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pathId = Number(id);
    if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

    const userId = request.cookies.get(ANON_COOKIE)?.value;

    // Get path info
    const [path] = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
        description: learningPaths.description,
        coverKey: learningPaths.coverKey,
        difficulty: learningPaths.difficulty,
        estimatedDays: learningPaths.estimatedDays,
        isPublished: learningPaths.isPublished,
        createdAt: learningPaths.createdAt,
        stepCount: sql<number>`(SELECT count(*) FROM path_steps WHERE path_id = ${learningPaths.id})`.as('step_count'),
        enrollCount: sql<number>`(SELECT count(*) FROM path_enrollments WHERE path_id = ${learningPaths.id})`.as('enroll_count'),
      })
      .from(learningPaths)
      .where(and(eq(learningPaths.id, pathId), eq(learningPaths.isPublished, true)))
      .limit(1);

    if (!path) return NextResponse.json({ error: 'Khong tim thay' }, { status: 404 });

    // Get steps with doc info
    const steps = await db
      .select({
        id: pathSteps.id,
        pathId: pathSteps.pathId,
        docId: pathSteps.docId,
        phase: pathSteps.phase,
        phaseName: pathSteps.phaseName,
        stepOrder: pathSteps.stepOrder,
        note: pathSteps.note,
        docTitle: documents.title,
        docFileType: documents.fileType,
        docVideoSource: documents.videoSource,
        docIsPublished: documents.isPublished,
      })
      .from(pathSteps)
      .leftJoin(documents, eq(pathSteps.docId, documents.id))
      .where(eq(pathSteps.pathId, pathId))
      .orderBy(asc(pathSteps.phase), asc(pathSteps.stepOrder));

    // Get user progress if userId exists
    let completedDocIds: number[] = [];
    let isEnrolled = false;

    if (userId) {
      const progressRows = await db
        .select({ docId: pathProgress.docId })
        .from(pathProgress)
        .where(and(
          eq(pathProgress.pathId, pathId),
          eq(pathProgress.userId, userId),
          eq(pathProgress.isCompleted, true),
        ));
      completedDocIds = progressRows.map((r) => r.docId);

      const [enrollment] = await db
        .select({ id: sql<number>`1` })
        .from(sql`path_enrollments`)
        .where(and(
          eq(sql`path_id`, pathId),
          eq(sql`user_id`, sql`${userId}::uuid`),
        ))
        .limit(1);
      isEnrolled = !!enrollment;
    }

    const totalSteps = steps.length;
    const completedSteps = completedDocIds.length;
    const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return NextResponse.json({
      data: {
        path,
        steps: steps.map((s) => ({
          ...s,
          isCompleted: completedDocIds.includes(s.docId),
        })),
        progress: {
          totalSteps,
          completedSteps,
          percentComplete,
          isFinished: totalSteps > 0 && completedSteps === totalSteps,
          isEnrolled,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/learning-paths/[id]]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
