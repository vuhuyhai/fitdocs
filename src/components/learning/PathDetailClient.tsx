'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

interface ProgressData {
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
  isFinished: boolean;
  isEnrolled: boolean;
}

export default function PathDetailClient({
  pathId,
  initialProgress,
  totalSteps,
}: {
  pathId: number;
  initialProgress: ProgressData;
  totalSteps: number;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [enrolling, setEnrolling] = useState(false);
  const [showCert, setShowCert] = useState(false);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/learning-paths/${pathId}/enroll`, { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Da bat dau lo trinh!');
      setProgress((p) => ({ ...p, isEnrolled: true }));
      router.refresh();
    } catch {
      toast.error('Khong the bat dau lo trinh');
    } finally {
      setEnrolling(false);
    }
  }

  const percent = progress.percentComplete;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
      {!progress.isEnrolled ? (
        /* Not enrolled — CTA */
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-zinc-400 text-sm text-center">
            Bat dau lo trinh de theo doi tien do cua ban
          </p>
          <Button onClick={handleEnroll} loading={enrolling} size="lg">
            {enrolling ? 'Dang xu ly...' : 'Bat dau lo trinh'}
          </Button>
        </div>
      ) : (
        /* Enrolled — Progress */
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Tien do cua ban</h3>
            <span className="text-sm font-bold text-violet-400">{percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {progress.completedSteps} / {progress.totalSteps} tai lieu da hoan thanh
            </span>
            {progress.isFinished ? (
              <span className="text-green-400 font-medium">✓ Hoan thanh!</span>
            ) : (
              <span>Tiep tuc hoc</span>
            )}
          </div>
          {progress.isFinished && (
            <div className="flex items-center justify-center pt-2">
              <Button onClick={() => setShowCert(true)} variant="ghost">
                🎉 Nhan chung chi
              </Button>
            </div>
          )}
        </>
      )}

      {showCert && (
        <CertificateModal
          pathId={pathId}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}

function CertificateModal({ pathId, onClose }: { pathId: number; onClose: () => void }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'input' | 'display'>('input');

  if (step === 'input') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-bold text-zinc-100">🎉 Chuc mung!</h2>
          <p className="text-sm text-zinc-400">Nhap ten cua ban de nhan chung chi:</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyen Van A"
            className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Huy</Button>
            <Button
              onClick={() => { if (name.trim()) setStep('display'); else toast.error('Vui long nhap ten'); }}
            >
              Nhan chung chi →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-1 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <CertificateCanvas name={name.trim()} pathId={pathId} />
        <div className="flex gap-2 justify-center py-3 bg-zinc-900 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>Dong</Button>
        </div>
      </div>
    </div>
  );
}

function CertificateCanvas({ name, pathId }: { name: string; pathId: number }) {
  return (
    <div
      className="aspect-[3/2] bg-white flex flex-col items-center justify-center p-8 text-center"
      style={{ border: '6px solid #c73937', outline: '2px solid #d4af37', outlineOffset: '6px' }}
    >
      <p className="text-sm text-zinc-400 tracking-[0.3em] uppercase mb-2">Fitness Library</p>
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 tracking-wide mb-4">CHUNG CHI HOAN THANH</h2>
      <p className="text-sm text-zinc-500 mb-2">Chung nhan</p>
      <p className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: '#c73937' }}>{name}</p>
      <p className="text-sm text-zinc-500 mb-1">da hoan thanh lo trinh hoc</p>
      <p className="text-lg font-semibold text-zinc-800 mb-6">Lo trinh #{pathId}</p>
      <p className="text-xs text-zinc-400">
        Ngay hoan thanh: {new Date().toLocaleDateString('vi-VN')}
      </p>
    </div>
  );
}
