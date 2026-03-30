import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pathSteps } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stepId } = await params;
  const sid = Number(stepId);
  if (isNaN(sid)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

  try {
    const [deleted] = await db.delete(pathSteps).where(eq(pathSteps.id, sid)).returning({ id: pathSteps.id });
    if (!deleted) return NextResponse.json({ error: 'Khong tim thay' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE step]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
