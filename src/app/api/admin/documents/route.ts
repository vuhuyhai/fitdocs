import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { desc, count, eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

// ─── GET: list all docs for admin ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const PAGE_SIZE = 20;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: documents.id,
          title: documents.title,
          fileType: documents.fileType,
          isPublished: documents.isPublished,
          viewCount: documents.viewCount,
          shareCount: documents.shareCount,
          videoSource: documents.videoSource,
          createdAt: documents.createdAt,
          categoryName: categories.name,
        })
        .from(documents)
        .leftJoin(categories, eq(documents.categoryId, categories.id))
        .orderBy(desc(documents.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db.select({ total: count() }).from(documents),
    ]);

    return NextResponse.json({
      data: rows,
      pagination: { page, pageSize: PAGE_SIZE, total: Number(total) },
    });
  } catch (error) {
    console.error('[GET /api/admin/documents]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

// ─── POST: create document metadata ──────────────────────────────────────────
const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  fileType: z.enum(['pdf', 'video', 'article']),
  fileKey: z.string().optional(),
  thumbnailKey: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoSource: z.enum(['upload', 'link']).default('upload'),
  isPublished: z.boolean().default(false),
}).refine((data) => {
  if (data.fileType === 'pdf' && !data.fileKey) return false;
  if (data.fileType === 'video' && data.videoSource === 'upload' && !data.fileKey) return false;
  if (data.fileType === 'video' && data.videoSource === 'link' && !data.videoUrl) return false;
  if (data.fileType === 'article' && !data.content) return false;
  return true;
}, { message: 'Thiếu dữ liệu bắt buộc cho loại tài liệu này' });

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const values = {
      ...parsed.data,
      fileKey: parsed.data.fileKey ?? '',
    };
    const [doc] = await db.insert(documents).values(values).returning();
    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/documents]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
