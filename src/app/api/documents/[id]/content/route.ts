/**
 * Proxy PDF content from S3 — never exposes raw S3 URL to client.
 * Requires valid unlock token cookie.
 */
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { documents, unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { s3Client, BUCKET } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ANON_COOKIE } from '@/lib/anonymous-user';
import { FILE_CONTENT_TYPES } from '@/lib/constants';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Anti-hotlink: reject requests from other origins
    const referer = request.headers.get('referer');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    if (referer && baseUrl && !referer.startsWith(baseUrl)) {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) return new Response('Invalid ID', { status: 400 });

    const userId = request.cookies.get(ANON_COOKIE)?.value;
    if (!userId) return new Response('Unauthorized', { status: 403 });

    // Verify unlock
    const [token] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(and(eq(unlockTokens.userId, userId), eq(unlockTokens.documentId, docId)))
      .limit(1);
    if (!token) return new Response('Forbidden', { status: 403 });

    // Get document
    const [doc] = await db
      .select({ fileKey: documents.fileKey, fileType: documents.fileType, isPublished: documents.isPublished })
      .from(documents)
      .where(eq(documents.id, docId))
      .limit(1);
    if (!doc || !doc.isPublished) return new Response('Not found', { status: 404 });

    // Article type has no S3 file — content is in DB
    if (doc.fileType === 'article') {
      return new Response('Article content is served via /api/documents/[id]', { status: 400 });
    }

    if (!doc.fileKey) {
      return new Response('No file associated with this document', { status: 404 });
    }

    // Fetch from S3 and stream to client
    let s3Response;
    try {
      s3Response = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: doc.fileKey }),
      );
    } catch (s3Err) {
      console.error('[S3 GetObject failed]', s3Err);
      return new Response('Failed to retrieve file from storage', { status: 502 });
    }

    const contentType = FILE_CONTENT_TYPES[doc.fileType] ?? 'application/octet-stream';
    const bodyBytes = await s3Response.Body!.transformToByteArray();
    const buffer = Buffer.from(bodyBytes);

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store, no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[GET /api/documents/[id]/content]', error);
    return new Response('Server error', { status: 500 });
  }
}
