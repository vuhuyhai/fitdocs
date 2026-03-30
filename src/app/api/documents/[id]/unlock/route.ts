import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlockTokens, shareEvents, documents } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { getOrCreateAnonymousUser, ANON_COOKIE, ANON_COOKIE_MAX_AGE } from '@/lib/anonymous-user';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`${ip}:unlock`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
        { status: 429 },
      );
    }

    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    // Validate cookie UUID to prevent DB errors on tampered cookies
    const rawUserId = request.cookies.get(ANON_COOKIE)?.value;
    const existingUserId = rawUserId && UUID_RE.test(rawUserId) ? rawUserId : undefined;

    const { userId, isNew } = await getOrCreateAnonymousUser(existingUserId, ip);

    // Verify document exists and is published
    const [doc] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.id, docId), eq(documents.isPublished, true)))
      .limit(1);
    if (!doc) {
      return NextResponse.json({ error: 'Không tìm thấy tài liệu' }, { status: 404 });
    }

    // Check if already unlocked (idempotent)
    const [existing] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(and(eq(unlockTokens.userId, userId), eq(unlockTokens.documentId, docId)))
      .limit(1);

    if (!existing) {
      // Create unlock token
      await db.insert(unlockTokens).values({ userId, documentId: docId });

      // Record share event
      await db.insert(shareEvents).values({ userId, documentId: docId, platform: 'facebook' });

      // Increment shareCount
      await db
        .update(documents)
        .set({ shareCount: sql`${documents.shareCount} + 1` })
        .where(eq(documents.id, docId));
    }

    const response = NextResponse.json({ success: true, unlocked: true });

    if (isNew) {
      response.cookies.set(ANON_COOKIE, userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ANON_COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[POST /api/documents/[id]/unlock]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
