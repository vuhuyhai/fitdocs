import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';
import { FileTypeBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Tong quan -- Admin' };

async function fetchAdmin(path: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}${path}`, {
    cache: 'no-store',
    headers: { Cookie: `${COOKIE_NAME}=${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
        <span>{icon}</span><span>{label}</span>
      </div>
      <p className="text-3xl font-bold text-zinc-50">
        {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const [summaryRes, topDocsRes, pathStatsRes] = await Promise.all([
    fetchAdmin('/api/admin/analytics/summary'),
    fetchAdmin('/api/admin/analytics/top-docs?sort=views&limit=10'),
    fetchAdmin('/api/admin/analytics/path-stats'),
  ]);

  const summary = summaryRes?.data ?? {
    totalDocs: 0, totalViews: 0, totalUnlocks: 0,
    totalShares: 0, totalMembers: 0, unlockRate: 0,
    activePaths: 0, pathEnrollments: 0,
  };

  const topDocs = topDocsRes?.data ?? [];
  const pathStats = pathStatsRes?.data ?? [];

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Tong quan</h1>
          <p className="text-zinc-500 text-sm mt-1">Thong ke he thong FitDocs</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/upload" className="px-3 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">
            + Tai len
          </a>
        </div>
      </div>

      {/* Summary cards — 3x2 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon="📄" label="Tai lieu" value={summary.totalDocs} sub="bai" />
        <StatCard icon="👁" label="Luot xem" value={summary.totalViews} sub="luot" />
        <StatCard icon="🔓" label="Luot unlock" value={summary.totalUnlocks} sub="luot" />
        <StatCard icon="📘" label="Facebook" value={summary.totalShares} sub="luot share" />
        <StatCard icon="👥" label="Thanh vien" value={summary.totalMembers} sub="hoat dong" />
        <StatCard icon="🎯" label="Ti le unlock" value={`${summary.unlockRate}%`} />
      </div>

      {/* Top Documents */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-200">Top tai lieu</h2>
        {topDocs.length === 0 ? (
          <p className="text-sm text-zinc-600">Chua co du lieu</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  {['#', 'Ten', 'Loai', 'Luot xem', 'Shares'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {topDocs.map((doc: { id: number; title: string; fileType: string; viewCount: number; shareCount: number }, i: number) => (
                  <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-600">{i + 1}</td>
                    <td className="px-4 py-3 text-zinc-200 font-medium truncate max-w-xs">{doc.title}</td>
                    <td className="px-4 py-3"><FileTypeBadge type={doc.fileType} /></td>
                    <td className="px-4 py-3 text-zinc-400">{doc.viewCount.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-zinc-400">{doc.shareCount.toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Learning Path Stats */}
      {pathStats.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-zinc-200">Lo trinh hoc</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pathStats.map((ps: { id: number; title: string; difficulty: string; isPublished: boolean; stepCount: number; enrollments: number }) => (
              <div key={ps.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200 truncate flex-1">{ps.title}</span>
                  <Badge variant={ps.isPublished ? 'published' : 'draft'}>
                    {ps.isPublished ? 'Xuat ban' : 'Nhap'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{ps.enrollments} enroll</span>
                  <span>{ps.stepCount} buoc</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-200">Hanh dong nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/upload" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors">
            Tai tai lieu moi
          </a>
          <a href="/admin/tai-lieu" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors">
            Quan ly tai lieu
          </a>
          <a href="/admin/lo-trinh" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors">
            Quan ly lo trinh
          </a>
        </div>
      </div>
    </div>
  );
}
