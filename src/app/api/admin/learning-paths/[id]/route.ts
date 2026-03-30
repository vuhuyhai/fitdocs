import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { learningPaths } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  coverKey: z.string().nullable().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedDays: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pathId = Number(id);
  if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [updated] = await db
      .update(learningPaths)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(learningPaths.id, pathId))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Khong tim thay' }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PUT /api/admin/learning-paths/[id]]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pathId = Number(id);
  if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

  try {
    const [deleted] = await db.delete(learningPaths).where(eq(learningPaths.id, pathId)).returning({ id: learningPaths.id });
    if (!deleted) return NextResponse.json({ error: 'Khong tim thay' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/learning-paths/[id]]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
