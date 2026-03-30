/** Shared unlock verification — eliminates duplicate DB query pattern across 3 API routes */
import { db } from '@/lib/db';
import { unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Returns true if the anonymous user has an unlock token for this document.
 */
export async function hasUnlock(userId: string, docId: number): Promise<boolean> {
  const [token] = await db
    .select({ id: unlockTokens.id })
    .from(unlockTokens)
    .where(and(eq(unlockTokens.userId, userId), eq(unlockTokens.documentId, docId)))
    .limit(1);
  return !!token;
}
