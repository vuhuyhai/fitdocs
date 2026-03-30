import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export const metadata: Metadata = { title: 'Analytics — Admin' };

interface TopDoc {
  documentId: number;
  title: string | null;
  shares: number;
}

interface DailyShare {
  date: string;
  shares: number;
}

async function getShareAnalytics(days: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/analytics/shares?days=${days}`, {
    cache: 'no-store',
    headers: { Cookie: `${COOKIE_NAME}=${token}` },
  });
  if (!res.ok) return { topDocuments: [] as TopDoc[], dailyShares: [] as DailyShare[] };
  const { data } = await res.json() as { data: { topDocuments: TopDoc[]; dailyShares: DailyShare[] } };
  return data;
}

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { days: daysStr } = await searchParams;
  const days = Math.min(Number(daysStr ?? '7'), 30);
  const { topDocuments, dailyShares } = await getShareAnalytics(days);

  const totalShares = dailyShares.reduce((s, d) => s + Number(d.shares), 0);
  const maxShares = Math.max(...dailyShares.map((d) => Number(d.shares)), 1);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Analytics Chia sẻ</h1>
          <p className="text-zinc-500 text-sm mt-1">Thống kê lượt share và mở khóa tài liệu</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[7, 14, 30].map((d) => (
            <a
              key={d}
              href={`/admin/analytics?days=${d}`}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                days === d
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {d} ngày
            </a>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-2">
          <p className="text-zinc-500 text-sm">🔗 Tổng lượt share ({days} ngày)</p>
          <p className="text-3xl font-bold text-zinc-50">{totalShares.toLocaleString('vi-VN')}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-2">
          <p className="text-zinc-500 text-sm">📊 Tài liệu được share</p>
          <p className="text-3xl font-bold text-zinc-50">{topDocuments.length.toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {/* Daily bar chart */}
      {dailyShares.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-zinc-200">Lượt share theo ngày</h2>
          <div className="flex items-end gap-1.5 h-32">
            {dailyShares.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-violet-500/70 group-hover:bg-violet-400 rounded-t transition-colors"
                  style={{ height: `${(Number(d.shares) / maxShares) * 100}%`, minHeight: '4px' }}
                  title={`${d.date}: ${d.shares} lượt`}
                />
                <span className="text-[10px] text-zinc-600 rotate-45 origin-left truncate max-w-[28px]">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top documents */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-200">Top tài liệu được share</h2>
        </div>
        {topDocuments.length === 0 ? (
          <p className="p-6 text-center text-zinc-600 text-sm">Chưa có dữ liệu</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Tài liệu</th>
                <th className="text-right px-4 py-3 font-medium">Lượt share</th>
              </tr>
            </thead>
            <tbody>
              {topDocuments.map((doc, i) => (
                <tr key={doc.documentId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    <a
                      href={`/tai-lieu/${doc.documentId}`}
                      target="_blank"
                      className="hover:text-violet-400 transition-colors"
                    >
                      {doc.title ?? `Tài liệu #${doc.documentId}`}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-100 font-medium">
                    {Number(doc.shares).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
