import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { parseVideoUrl, getVideoEmbedUrl, getVideoThumbnailUrl, getVideoDomain } from '@/lib/video-url';

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
    }

    const parsed = parseVideoUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { valid: false, error: 'URL không phải YouTube, Google Drive, hoặc Vimeo' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      provider: parsed.provider,
      videoId: parsed.id,
      embedUrl: getVideoEmbedUrl(url),
      thumbnailUrl: getVideoThumbnailUrl(url),
      domain: getVideoDomain(url),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
