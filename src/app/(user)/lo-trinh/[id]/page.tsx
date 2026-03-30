import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { FileTypeBadge } from '@/components/ui/Badge';
import PathDetailClient from '@/components/learning/PathDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DIFFICULTY: Record<string, { text: string; variant: 'published' | 'draft' | 'default' }> = {
  beginner: { text: 'Co ban', variant: 'published' },
  intermediate: { text: 'Trung cap', variant: 'default' },
  advanced: { text: 'Nang cao', variant: 'draft' },
};

async function getPathDetail(id: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/learning-paths/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getPathDetail(Number(id));
  if (!data) return { title: 'Khong tim thay' };
  return { title: `${data.path.title} -- Lo trinh hoc` };
}

export default async function LearningPathDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pathId = Number(id);
  if (isNaN(pathId)) notFound();

  const data = await getPathDetail(pathId);
  if (!data) notFound();

  const { path, steps, progress } = data;

  // Group steps by phase
  const phases = new Map<number, typeof steps>();
  for (const step of steps) {
    const arr = phases.get(step.phase) ?? [];
    arr.push(step);
    phases.set(step.phase, arr);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300 transition-colors">Trang chu</Link>
        <span>/</span>
        <Link href="/lo-trinh" className="hover:text-zinc-300 transition-colors">Lo trinh hoc</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-[200px]">{path.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={DIFFICULTY[path.difficulty]?.variant ?? 'default'}>
            {DIFFICULTY[path.difficulty]?.text ?? path.difficulty}
          </Badge>
          {path.estimatedDays > 0 && (
            <span className="text-xs text-zinc-500">~{path.estimatedDays} ngay</span>
          )}
          <span className="text-xs text-zinc-500">👥 {path.enrollCount} dang hoc cung</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50">{path.title}</h1>
        {path.description && <p className="text-zinc-400 leading-relaxed">{path.description}</p>}
      </div>

      {/* Client-side interactive parts (enroll, progress) */}
      <PathDetailClient
        pathId={pathId}
        initialProgress={progress}
        totalSteps={steps.length}
      />

      {/* Steps list grouped by phase */}
      <div className="flex flex-col gap-6">
        {Array.from(phases.entries()).map(([phase, phaseSteps]) => {
          const completedInPhase = phaseSteps.filter((s: { isCompleted: boolean }) => s.isCompleted).length;
          const phaseComplete = completedInPhase === phaseSteps.length && phaseSteps.length > 0;

          return (
            <div key={phase} className="flex flex-col gap-2">
              {/* Phase header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                  Giai doan {phase} {phaseSteps[0]?.phaseName ? `-- ${phaseSteps[0].phaseName}` : ''}
                </h3>
                <span className="text-xs text-zinc-500">
                  {completedInPhase}/{phaseSteps.length} hoan thanh
                </span>
              </div>

              {/* Milestone badge */}
              {phaseComplete && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                  <span>🏆</span>
                  <span className="text-sm text-green-400 font-medium">
                    Hoan thanh Giai doan {phase}!
                  </span>
                </div>
              )}

              {/* Steps */}
              <div className="flex flex-col gap-1">
                {phaseSteps.map((step: {
                  id: number;
                  docId: number;
                  stepOrder: number;
                  isCompleted: boolean;
                  docTitle: string | null;
                  docFileType: string | null;
                  docVideoSource: string | null;
                  note: string;
                }, i: number) => (
                  <Link
                    key={step.id}
                    href={`/tai-lieu/${step.docId}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-violet-500/40 hover:bg-zinc-800/50 transition-colors group"
                  >
                    {/* Status icon */}
                    <span className="text-base shrink-0">
                      {step.isCompleted ? '✅' : '○'}
                    </span>

                    {/* Step number */}
                    <span className="text-xs text-zinc-600 w-14 shrink-0">Buoc {i + 1}</span>

                    {/* Badge */}
                    <FileTypeBadge
                      type={step.docFileType ?? 'pdf'}
                      videoSource={step.docVideoSource ?? undefined}
                    />

                    {/* Title */}
                    <span className="text-sm text-zinc-300 group-hover:text-violet-300 transition-colors flex-1 truncate">
                      {step.docTitle ?? `Tai lieu #${step.docId}`}
                    </span>

                    {/* Action label */}
                    <span className="text-xs text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0">
                      {step.isCompleted ? 'Xem lai' : 'Hoc ngay →'}
                    </span>
                  </Link>
                ))}

                {/* Step notes (separate from link for readability) */}
                {phaseSteps.filter((s: { note: string }) => s.note).map((step: { id: number; note: string }) => (
                  <div key={`note-${step.id}`} className="ml-14 text-xs text-zinc-600 italic">
                    📝 {step.note}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
