import Link from 'next/link';
import { db } from '@/lib/db';
import { documents, categories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import DocumentCard from '@/components/library/DocumentCard';

async function getFeaturedDocs() {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      description: documents.description,
      fileType: documents.fileType,
      thumbnailKey: documents.thumbnailKey,
      viewCount: documents.viewCount,
      shareCount: documents.shareCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(documents)
    .leftJoin(categories, eq(documents.categoryId, categories.id))
    .where(eq(documents.isPublished, true))
    .orderBy(desc(documents.shareCount))
    .limit(6);
}

async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export default async function HomePage() {
  const [featured, cats] = await Promise.all([getFeaturedDocs(), getAllCategories()]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <span>💪</span>
            <span>Thư viện tài liệu Fitness chuyên biệt</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 mb-6">
            Nâng cao trình độ
            <br />
            <span className="text-violet-400">tập luyện của bạn</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Kho tai lieu PDF, Video va Bai viet huong dan tap luyen, dinh duong tu cac chuyen gia.
            Doc truc tuyen, mien phi -- chi can chia se.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/thu-vien"
              className="px-6 py-3 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors text-base btn-press"
            >
              Khám phá thư viện →
            </Link>
            <Link
              href="/thu-vien?category=tap-luyen"
              className="px-6 py-3 rounded-xl font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors text-base btn-press"
            >
              Bắt đầu tập luyện
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-zinc-800 text-center">
          {[
            { value: cats.length.toString(), label: 'Danh mục' },
            { value: featured.length > 0 ? '7+' : '0', label: 'Tài liệu' },
            { value: '100%', label: 'Miễn phí' },
          ].map(({ value, label }) => (
            <div key={label} className="px-4">
              <div className="text-2xl font-bold text-violet-400">{value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-14 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-50">Danh mục</h2>
          <Link href="/thu-vien" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/thu-vien?category=${cat.slug}`}
              className="card-hover btn-press flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-violet-500/50 hover:bg-zinc-800/50 group text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-50 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured docs */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-50">Tài liệu nổi bật</h2>
            <Link href="/thu-vien" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="list-animate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((doc) => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
