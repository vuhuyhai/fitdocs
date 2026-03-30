import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ error: 'Không thể tải danh mục' }, { status: 500 });
  }
}
