import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminPassword, createAdminToken, COOKIE_NAME } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`${ip}:admin-login`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Quá nhiều lần thử. Vui lòng thử lại sau.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    if (!checkAdminPassword(parsed.data.password)) {
      return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
    }

    const token = createAdminToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('[POST /api/admin/login]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
