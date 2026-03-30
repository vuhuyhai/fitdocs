import { db } from '@/lib/db';
import { anonymousUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const ANON_COOKIE = 'anon_id';
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get or create an anonymous user by UUID from cookie.
 * Returns the userId (UUID string) and whether it was newly created.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrCreateAnonymousUser(
  userId: string | undefined,
  ipAddress?: string,
): Promise<{ userId: string; isNew: boolean }> {
  // Validate UUID format to prevent DB errors on tampered cookies
  if (userId && !UUID_RE.test(userId)) userId = undefined;

  if (userId) {
    // Touch lastSeen and return existing
    const [existing] = await db
      .update(anonymousUsers)
      .set({ lastSeen: new Date() })
      .where(eq(anonymousUsers.id, userId))
      .returning({ id: anonymousUsers.id });

    if (existing) {
      return { userId: existing.id, isNew: false };
    }
  }

  // Create new anonymous user
  const [created] = await db
    .insert(anonymousUsers)
    .values({ ipAddress: ipAddress ?? null })
    .returning({ id: anonymousUsers.id });

  return { userId: created.id, isNew: true };
}
