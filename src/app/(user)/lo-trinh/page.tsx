import type { Metadata } from 'next';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Lo trinh hoc' };

const DIFFICULTY: Record<string, { text: string; variant: 'published' | 'draft' | 'default' }> = {
  beginner: { text: 'Co ban', variant: 'published' },
  intermediate: { text: 'Trung cap', variant: 'default' },
  advanced: { text: 'Nang cao', variant: 'draft' },
};

interface PathData {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  estimatedDays: number;
  stepCount: number;
  enrollCount: number;
}

async function getPaths(): Promise<PathData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/learning-paths`, { cache: 'no-store' });
  if (!res.ok) return [];
  const { data } = await res.json();
  return data;
}

export default async function LearningPathsPage() {
  const paths = await getPaths();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50 mb-1">Lo trinh hoc</h1>
        <p className="text-zinc-400">Hoc co he thong, tien bo tung ngay</p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl opacity-30">🗺️</span>
          <p className="text-zinc-500 mt-3">Chua co lo trinh nao</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={`/lo-trinh/${path.id}`}
              className="group flex gap-4 sm:gap-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-violet-500/50 hover:bg-zinc-800/50 transition-colors"
            >
              {/* Cover placeholder */}
              <div className="w-32 sm:w-40 h-24 rounded-lg bg-gradient-to-b from-violet-900/30 to-violet-950 flex items-center justify-center shrink-0">
                <span className="text-3xl opacity-60">🗺️</span>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={DIFFICULTY[path.difficulty]?.variant ?? 'default'}>
                    {DIFFICULTY[path.difficulty]?.text ?? path.difficulty}
                  </Badge>
                  <h2 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                    {path.title}
                  </h2>
                </div>

                {path.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">{path.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>📄 {path.stepCount} tai lieu</span>
                  {path.estimatedDays > 0 && <span>📅 ~{path.estimatedDays} ngay</span>}
                  <span>👥 {path.enrollCount} dang hoc</span>
                </div>

                {/* Progress bar placeholder */}
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500 w-0" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Chua bat dau</span>
                  <span className="text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
                    Xem lo trinh →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
