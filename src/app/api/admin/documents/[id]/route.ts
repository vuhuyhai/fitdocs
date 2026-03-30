import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  isPublished: z.boolean().optional(),
  thumbnailKey: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (isNaN(docId)) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [updated] = await db
      .update(documents)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(documents.id, docId))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PUT /api/admin/documents/[id]]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (isNaN(docId)) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  try {
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, docId))
      .returning({ id: documents.id });

    if (!deleted) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/documents/[id]]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
