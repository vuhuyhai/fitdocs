import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { pathSteps, documents } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pathId = Number(id);
  if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

  try {
    const rows = await db
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
      })
      .from(pathSteps)
      .leftJoin(documents, eq(pathSteps.docId, documents.id))
      .where(eq(pathSteps.pathId, pathId))
      .orderBy(asc(pathSteps.phase), asc(pathSteps.stepOrder));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/admin/learning-paths/[id]/steps]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}

const addStepSchema = z.object({
  docId: z.number().int().positive(),
  phase: z.number().int().min(1).default(1),
  phaseName: z.string().default(''),
  stepOrder: z.number().int().min(0).default(0),
  note: z.string().default(''),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pathId = Number(id);
  if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

  try {
    const body = await request.json();
    const parsed = addStepSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [step] = await db.insert(pathSteps).values({ pathId, ...parsed.data }).returning();
    return NextResponse.json({ data: step }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/learning-paths/[id]/steps]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}

const reorderSchema = z.object({
  stepIds: z.array(z.number().int()),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await Promise.all(
      parsed.data.stepIds.map((stepId, index) =>
        db.update(pathSteps).set({ stepOrder: index }).where(eq(pathSteps.id, stepId))
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[PATCH /api/admin/learning-paths/[id]/steps]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
