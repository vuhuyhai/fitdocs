import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { ANON_COOKIE } from '@/lib/anonymous-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) {
      return NextResponse.json({ unlocked: false }, { status: 400 });
    }

    const userId = request.cookies.get(ANON_COOKIE)?.value;
    if (!userId) {
      return NextResponse.json({ unlocked: false });
    }

    const [token] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(
        and(
          eq(unlockTokens.userId, userId),
          eq(unlockTokens.documentId, docId),
        ),
      )
      .limit(1);

    return NextResponse.json({ unlocked: !!token });
  } catch (error) {
    console.error('[GET /api/documents/[id]/unlock-status]', error);
    return NextResponse.json({ unlocked: false }, { status: 500 });
  }
}
