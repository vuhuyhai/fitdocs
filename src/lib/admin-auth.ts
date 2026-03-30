/** Admin authentication helper — eliminates isAdmin() duplication across 5 API routes */
import type { NextRequest } from 'next/server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/auth';

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return !!token && verifyAdminToken(token);
}
