import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPresignedUploadUrl } from '@/lib/s3';
import { isAdmin } from '@/lib/admin-auth';
import { S3_FOLDERS } from '@/lib/constants';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'video/mp4': 'video',
  'video/x-matroska': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/webm': 'video',
  'image/jpeg': 'thumb',
  'image/png': 'thumb',
  'image/webp': 'thumb',
};

const bodySchema = z.object({
  contentType: z.string(),
  fileName: z.string(),
});

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const { contentType, fileName } = parsed.data;
    const fileCategory = ALLOWED_TYPES[contentType];
    if (!fileCategory) {
      return NextResponse.json({ error: 'Loại file không được hỗ trợ' }, { status: 400 });
    }

    const ext = fileName.split('.').pop() ?? '';
    const folder = fileCategory === 'thumb' ? S3_FOLDERS.thumbnails : fileCategory === 'video' ? S3_FOLDERS.videos : S3_FOLDERS.documents;
    const key = `${folder}/${randomUUID()}.${ext}`;

    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error('[POST /api/admin/upload-url]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
