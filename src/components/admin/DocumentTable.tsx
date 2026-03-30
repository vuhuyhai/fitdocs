'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileTypeBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';

interface DocRow {
  id: number;
  title: string;
  fileType: string;
  videoSource?: string | null;
  isPublished: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  categoryName: string | null;
}

export default function DocumentTable({ docs }: { docs: DocRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulking, setBulking] = useState(false);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === docs.length) setSelected(new Set());
    else setSelected(new Set(docs.map((d) => d.id)));
  }

  async function bulkAction(action: 'publish' | 'unpublish' | 'delete') {
    if (selected.size === 0) return;
    if (action === 'delete' && !confirm(`Xoa ${selected.size} tai lieu?`)) return;
    setBulking(true);
    try {
      const res = await fetch('/api/admin/documents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (!res.ok) throw new Error();
      const labels = { publish: 'Xuat ban', unpublish: 'An', delete: 'Xoa' };
      toast.success(`${labels[action]} ${selected.size} tai lieu thanh cong`);
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error('Thao tac that bai');
    } finally {
      setBulking(false);
    }
  }

  async function handleTogglePublish(doc: DocRow) {
    setToggling(doc.id);
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
      });
      if (!res.ok) throw new Error();
      toast.success(doc.isPublished ? 'Da an tai lieu' : 'Da xuat ban tai lieu');
      router.refresh();
    } catch {
      toast.error('Thao tac that bai');
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Ban chac chan muon xoa "${title}"?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Da xoa tai lieu');
      router.refresh();
    } catch {
      toast.error('Xoa that bai');
    } finally {
      setDeleting(null);
    }
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="text-5xl opacity-30">📭</span>
        <p className="text-zinc-400">Chua co tai lieu nao</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/30 bg-violet-500/5">
          <span className="text-sm text-violet-300 font-medium">{selected.size} da chon</span>
          <button onClick={toggleAll} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            {selected.size === docs.length ? 'Bo chon' : 'Chon tat ca'}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => bulkAction('publish')}
            disabled={bulking}
            className="text-xs px-2.5 py-1 rounded-md border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
          >
            Xuat ban
          </button>
          <button
            onClick={() => bulkAction('unpublish')}
            disabled={bulking}
            className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-50 transition-colors disabled:opacity-50"
          >
            An
          </button>
          <button
            onClick={() => bulkAction('delete')}
            disabled={bulking}
            className="text-xs px-2.5 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Xoa
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === docs.length && docs.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              {['Ten tai lieu', 'Loai', 'Danh muc', 'Luot xem', 'Chia se', 'Trang thai', 'Hanh dong'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {docs.map((doc) => (
              <tr key={doc.id} className={`hover:bg-zinc-800/30 transition-colors ${selected.has(doc.id) ? 'bg-violet-500/5' : ''}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(doc.id)}
                    onChange={() => toggleSelect(doc.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium text-zinc-200 truncate">{doc.title}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</p>
                </td>
                <td className="px-4 py-3"><FileTypeBadge type={doc.fileType} videoSource={doc.videoSource ?? undefined} /></td>
                <td className="px-4 py-3 text-zinc-400">{doc.categoryName ?? <span className="text-zinc-700">--</span>}</td>
                <td className="px-4 py-3 text-zinc-400">{doc.viewCount.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-400">{doc.shareCount.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <Badge variant={doc.isPublished ? 'published' : 'draft'}>
                    {doc.isPublished ? 'Xuat ban' : 'Nhap'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(doc)}
                      disabled={toggling === doc.id}
                      className="text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-50 hover:border-zinc-500 transition-colors disabled:opacity-50"
                    >
                      {toggling === doc.id ? '...' : doc.isPublished ? 'An' : 'Xuat ban'}
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deleting === doc.id}
                      className="text-xs px-2.5 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === doc.id ? '...' : 'Xoa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
