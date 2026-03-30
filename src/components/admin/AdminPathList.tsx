'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface PathRow {
  id: number;
  title: string;
  difficulty: string;
  isPublished: boolean;
  stepCount: number;
  enrollCount: number;
  createdAt: string;
}

const DIFFICULTY_LABELS: Record<string, { text: string; variant: 'published' | 'draft' | 'default' }> = {
  beginner: { text: 'Co ban', variant: 'published' },
  intermediate: { text: 'Trung cap', variant: 'default' },
  advanced: { text: 'draft', variant: 'draft' },
};

export default function AdminPathList() {
  const router = useRouter();
  const [paths, setPaths] = useState<PathRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPaths = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/learning-paths');
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setPaths(data);
    } catch {
      toast.error('Khong the tai danh sach lo trinh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPaths(); }, [fetchPaths]);

  async function handleTogglePublish(path: PathRow) {
    try {
      const res = await fetch(`/api/admin/learning-paths/${path.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !path.isPublished }),
      });
      if (!res.ok) throw new Error();
      toast.success(path.isPublished ? 'Da an lo trinh' : 'Da xuat ban lo trinh');
      fetchPaths();
    } catch {
      toast.error('Thao tac that bai');
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Ban chac chan muon xoa "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/learning-paths/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Da xoa lo trinh');
      fetchPaths();
    } catch {
      toast.error('Xoa that bai');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Dong form' : '+ Tao lo trinh'}
        </Button>
      </div>

      {showForm && <CreatePathForm onCreated={() => { setShowForm(false); fetchPaths(); }} />}

      {loading ? (
        <div className="text-center py-8 text-zinc-500">Dang tai...</div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">Chua co lo trinh nao</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                {['Ten', 'Kho do', 'So buoc', 'Da enroll', 'Trang thai', 'Hanh dong'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paths.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/lo-trinh/${p.id}`)}
                      className="font-medium text-zinc-200 hover:text-violet-300 transition-colors text-left"
                    >
                      {p.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={DIFFICULTY_LABELS[p.difficulty]?.variant ?? 'default'}>
                      {DIFFICULTY_LABELS[p.difficulty]?.text ?? p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{p.stepCount}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.enrollCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isPublished ? 'published' : 'draft'}>
                      {p.isPublished ? 'Xuat ban' : 'Nhap'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/lo-trinh/${p.id}`)}
                        className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-50 hover:border-zinc-500 transition-colors"
                      >
                        Sua
                      </button>
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-50 hover:border-zinc-500 transition-colors"
                      >
                        {p.isPublished ? 'An' : 'Xuat ban'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="text-xs px-2.5 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Xoa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreatePathForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error('Tieu de khong duoc de trong'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), difficulty, estimatedDays }),
      });
      if (!res.ok) throw new Error();
      toast.success('Da tao lo trinh');
      onCreated();
    } catch {
      toast.error('Tao lo trinh that bai');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-4 max-w-xl">
      <h3 className="font-semibold text-zinc-200 text-sm">Tao lo trinh moi</h3>
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
      <div className="flex gap-3">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500"
        >
          <option value="beginner">Co ban</option>
          <option value="intermediate">Trung cap</option>
          <option value="advanced">Nang cao</option>
        </select>
        <input
          type="number"
          min={0}
          value={estimatedDays}
          onChange={(e) => setEstimatedDays(Number(e.target.value))}
          placeholder="So ngay"
          className="w-24 px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500"
        />
        <span className="text-sm text-zinc-500 self-center">ngay</span>
      </div>
      <Button type="submit" loading={saving}>{saving ? 'Dang tao...' : 'Tao lo trinh'}</Button>
    </form>
  );
}
