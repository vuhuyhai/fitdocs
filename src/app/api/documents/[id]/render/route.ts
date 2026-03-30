/**
 * Convert DOCX → HTML via mammoth.
 * Only returns HTML — never exposes S3 path or raw DOCX bytes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { s3Client, BUCKET } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import mammoth from 'mammoth';
import { ANON_COOKIE } from '@/lib/anonymous-user';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const userId = request.cookies.get(ANON_COOKIE)?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Verify unlock
    const [token] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(and(eq(unlockTokens.userId, userId), eq(unlockTokens.documentId, docId)))
      .limit(1);
    if (!token) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get document
    const [doc] = await db
      .select({ fileKey: documents.fileKey, fileType: documents.fileType, isPublished: documents.isPublished })
      .from(documents)
      .where(eq(documents.id, docId))
      .limit(1);
    if (!doc || !doc.isPublished) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (doc.fileType !== 'docx') return NextResponse.json({ error: 'Not a DOCX file' }, { status: 400 });

    // Fetch from S3
    const s3Response = await s3Client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: doc.fileKey }),
    );
    const buffer = Buffer.from(await s3Response.Body!.transformToByteArray());

    // Convert DOCX → HTML
    const result = await mammoth.convertToHtml({ buffer });

    return NextResponse.json({ html: result.value }, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (error) {
    console.error('[GET /api/documents/[id]/render]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
