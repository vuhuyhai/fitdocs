'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { FileTypeBadge } from '@/components/ui/Badge';

interface StepRow {
  id: number;
  pathId: number;
  docId: number;
  phase: number;
  phaseName: string;
  stepOrder: number;
  note: string;
  docTitle: string | null;
  docFileType: string | null;
  docVideoSource: string | null;
}

export default function AdminPathEditor({ pathId }: { pathId: number }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add step form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; title: string; fileType: string }[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [newPhase, setNewPhase] = useState(1);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newNote, setNewNote] = useState('');

  const fetchPath = useCallback(async () => {
    try {
      const [pathRes, stepsRes] = await Promise.all([
        fetch(`/api/admin/learning-paths/${pathId}`, { method: 'GET' }).then((r) => {
          // Admin GET not available on public route, use PUT with empty body to check
          // Actually we need to get it from the list
          return fetch('/api/admin/learning-paths');
        }),
        fetch(`/api/admin/learning-paths/${pathId}/steps`),
      ]);

      if (pathRes.ok) {
        const { data: paths } = await pathRes.json();
        const path = paths.find((p: { id: number }) => p.id === pathId);
        if (path) {
          setTitle(path.title);
          setDescription(path.description ?? '');
          setDifficulty(path.difficulty);
          setEstimatedDays(path.estimatedDays);
          setIsPublished(path.isPublished);
        }
      }

      if (stepsRes.ok) {
        const { data } = await stepsRes.json();
        setSteps(data);
      }
    } catch {
      toast.error('Khong the tai thong tin lo trinh');
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  useEffect(() => { fetchPath(); }, [fetchPath]);

  async function handleSave() {
    if (!title.trim()) { toast.error('Tieu de khong duoc de trong'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/learning-paths/${pathId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), difficulty, estimatedDays, isPublished }),
      });
      if (!res.ok) throw new Error();
      toast.success('Da luu lo trinh');
    } catch {
      toast.error('Luu that bai');
    } finally {
      setSaving(false);
    }
  }

  async function searchDocs() {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/admin/documents?page=1`);
      if (!res.ok) return;
      const { data } = await res.json();
      setSearchResults(
        data.filter((d: { title: string }) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 10),
      );
    } catch { /* ignore */ }
  }

  async function addStep() {
    if (!selectedDocId) { toast.error('Chon tai lieu truoc'); return; }
    try {
      const res = await fetch(`/api/admin/learning-paths/${pathId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: selectedDocId,
          phase: newPhase,
          phaseName: newPhaseName.trim(),
          stepOrder: steps.length,
          note: newNote.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Da them buoc');
      setSelectedDocId(null);
      setSearchQuery('');
      setSearchResults([]);
      setNewNote('');
      fetchPath();
    } catch {
      toast.error('Them buoc that bai');
    }
  }

  async function removeStep(stepId: number) {
    try {
      const res = await fetch(`/api/admin/learning-paths/${pathId}/steps/${stepId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Da xoa buoc');
      fetchPath();
    } catch {
      toast.error('Xoa that bai');
    }
  }

  if (loading) return <div className="text-center py-8 text-zinc-500">Dang tai...</div>;

  // Group steps by phase
  const phases = new Map<number, StepRow[]>();
  for (const s of steps) {
    const arr = phases.get(s.phase) ?? [];
    arr.push(s);
    phases.set(s.phase, arr);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/lo-trinh')} className="text-zinc-500 hover:text-zinc-300 text-sm">
          ← Quay lai
        </button>
        <h1 className="text-xl font-bold text-zinc-50">Sua lo trinh</h1>
      </div>

      {/* Path info form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ten lo trinh..."
          className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mo ta..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
        />
        <div className="flex gap-3 flex-wrap">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500"
          >
            <option value="beginner">Co ban</option>
            <option value="intermediate">Trung cap</option>
            <option value="advanced">Nang cao</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500"
            />
            <span className="text-sm text-zinc-500">ngay</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded"
            />
            Xuat ban
          </label>
        </div>
        <Button onClick={handleSave} loading={saving}>{saving ? 'Dang luu...' : 'Luu thay doi'}</Button>
      </div>

      {/* Steps */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-zinc-200 text-sm">Cac buoc trong lo trinh ({steps.length})</h2>

        {/* Steps list grouped by phase */}
        {Array.from(phases.entries()).map(([phase, phaseSteps]) => (
          <div key={phase} className="flex flex-col gap-2">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Giai doan {phase} {phaseSteps[0]?.phaseName ? `-- ${phaseSteps[0].phaseName}` : ''}
            </div>
            {phaseSteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-600 w-6">{i + 1}.</span>
                <FileTypeBadge type={s.docFileType ?? 'pdf'} videoSource={s.docVideoSource ?? undefined} />
                <span className="text-sm text-zinc-300 flex-1 truncate">{s.docTitle ?? `Doc #${s.docId}`}</span>
                {s.note && <span className="text-xs text-zinc-600 truncate max-w-[120px]">{s.note}</span>}
                <button
                  onClick={() => removeStep(s.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  Xoa
                </button>
              </div>
            ))}
          </div>
        ))}

        {steps.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-4">Chua co buoc nao. Them buoc ben duoi.</p>
        )}

        {/* Add step */}
        <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Them buoc moi</h3>
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDocs()}
              placeholder="Tim tai lieu..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={searchDocs}
              className="px-3 py-2 rounded-lg text-sm bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
            >
              Tim
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-40 overflow-auto">
              {searchResults.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDocId(doc.id); setSearchQuery(doc.title); setSearchResults([]); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedDocId === doc.id ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <FileTypeBadge type={doc.fileType} /> <span className="ml-2">{doc.title}</span>
                </button>
              ))}
            </div>
          )}

          {selectedDocId && (
            <div className="flex gap-2 flex-wrap items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Giai doan</label>
                <input
                  type="number"
                  min={1}
                  value={newPhase}
                  onChange={(e) => setNewPhase(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Ten giai doan</label>
                <input
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="Nen tang..."
                  className="w-32 px-2 py-1.5 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Ghi chu</label>
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ghi chu..."
                  className="w-40 px-2 py-1.5 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <Button onClick={addStep} size="sm">Them</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
