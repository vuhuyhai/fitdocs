import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { documents } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

const bulkSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  action: z.enum(['publish', 'unpublish', 'delete']),
});

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { ids, action } = parsed.data;

    switch (action) {
      case 'publish':
        await db.update(documents)
          .set({ isPublished: true, updatedAt: new Date() })
          .where(inArray(documents.id, ids));
        break;
      case 'unpublish':
        await db.update(documents)
          .set({ isPublished: false, updatedAt: new Date() })
          .where(inArray(documents.id, ids));
        break;
      case 'delete':
        await db.delete(documents).where(inArray(documents.id, ids));
        break;
    }

    return NextResponse.json({ ok: true, affected: ids.length });
  } catch (error) {
    console.error('[POST /api/admin/documents/bulk]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
