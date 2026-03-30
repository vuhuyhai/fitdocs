import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_SECRET ?? (() => {
  throw new Error('ADMIN_SECRET env var is required but not set');
})();
const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export { COOKIE_NAME };

export function createAdminToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;

    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    // Check expiry
    const tsStr = payload.split(':')[1];
    if (!tsStr || Date.now() - Number(tsStr) > SESSION_TTL_MS) return false;

    const expectedSig = createHmac('sha256', SECRET).update(payload).digest('hex');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');
    const sigBuf = Buffer.from(sig, 'utf-8');
    if (expectedBuf.length !== sigBuf.length) return false;

    return timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!adminPassword) {
    console.error('[auth] ADMIN_PASSWORD env var is not set — login will always fail');
    return false;
  }
  if (!password) return false;
  const expected = Buffer.from(adminPassword, 'utf-8');
  const given = Buffer.from(password, 'utf-8');
  if (expected.length !== given.length) return false;
  try {
    return timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}
