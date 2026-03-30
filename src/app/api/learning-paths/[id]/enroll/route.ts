import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pathEnrollments, learningPaths } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getOrCreateAnonymousUser, ANON_COOKIE, ANON_COOKIE_MAX_AGE } from '@/lib/anonymous-user';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pathId = Number(id);
    if (isNaN(pathId)) return NextResponse.json({ error: 'ID khong hop le' }, { status: 400 });

    const [path] = await db
      .select({ id: learningPaths.id })
      .from(learningPaths)
      .where(and(eq(learningPaths.id, pathId), eq(learningPaths.isPublished, true)))
      .limit(1);
    if (!path) return NextResponse.json({ error: 'Khong tim thay' }, { status: 404 });

    const rawUserId = request.cookies.get(ANON_COOKIE)?.value;
    const { userId, isNew } = await getOrCreateAnonymousUser(rawUserId);

    await db.insert(pathEnrollments).values({ pathId, userId });

    const res = NextResponse.json({ ok: true }, { status: 201 });
    if (isNew) {
      res.cookies.set(ANON_COOKIE, userId, {
        maxAge: ANON_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
    return res;
  } catch (error) {
    console.error('[POST /api/learning-paths/[id]/enroll]', error);
    return NextResponse.json({ error: 'Loi may chu' }, { status: 500 });
  }
}
