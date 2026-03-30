/**
 * Returns a presigned S3 URL — video only.
 * PDF and DOCX are served through /content and /render proxies respectively.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, unlockTokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { ANON_COOKIE } from '@/lib/anonymous-user';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docId = Number(id);
    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const rawUserId = request.cookies.get(ANON_COOKIE)?.value;
    if (!rawUserId || !UUID_RE.test(rawUserId)) {
      return NextResponse.json({ error: 'Chưa mở khóa' }, { status: 403 });
    }

    // Verify unlock exists
    const [token] = await db
      .select({ id: unlockTokens.id })
      .from(unlockTokens)
      .where(and(eq(unlockTokens.userId, rawUserId), eq(unlockTokens.documentId, docId)))
      .limit(1);
    if (!token) {
      return NextResponse.json({ error: 'Chưa mở khóa' }, { status: 403 });
    }

    // Get document — video only
    const [doc] = await db
      .select({
        fileKey: documents.fileKey,
        fileType: documents.fileType,
        isPublished: documents.isPublished,
        videoUrl: documents.videoUrl,
        videoSource: documents.videoSource,
      })
      .from(documents)
      .where(eq(documents.id, docId))
      .limit(1);

    if (!doc || !doc.isPublished) {
      return NextResponse.json({ error: 'Không tìm thấy tài liệu' }, { status: 404 });
    }

    if (doc.fileType !== 'video') {
      return NextResponse.json({ error: 'Chỉ hỗ trợ xem video qua endpoint này' }, { status: 400 });
    }

    // Video link — return embed URL directly
    if (doc.videoSource === 'link' && doc.videoUrl) {
      const { getVideoEmbedUrl } = await import('@/lib/video-url');
      const embedUrl = getVideoEmbedUrl(doc.videoUrl);
      if (!embedUrl) {
        return NextResponse.json({ error: 'URL video không hợp lệ' }, { status: 400 });
      }
      return NextResponse.json({ url: embedUrl, source: 'link' });
    }

    // Video upload — return presigned S3 URL
    const url = await getPresignedDownloadUrl(doc.fileKey);
    return NextResponse.json({ url, source: 'upload' });
  } catch (error) {
    console.error('[GET /api/documents/[id]/view-url]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
