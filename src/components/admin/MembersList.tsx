'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface MemberRow {
  userId: string | null;
  totalShares: number;
  unlockedDocs: number;
  firstSharedAt: string;
  lastSharedAt: string;
}

export default function MembersList() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members?page=${p}`);
      if (!res.ok) throw new Error();
      const { data, pagination } = await res.json();
      setMembers(data);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch {
      toast.error('Khong the tai danh sach thanh vien');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(page); }, [page, fetchMembers]);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-1">
          <span className="text-xs text-zinc-500">👥 Tong thanh vien</span>
          <span className="text-2xl font-bold text-zinc-50">{total}</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-1">
          <span className="text-xs text-zinc-500">📘 Tong share</span>
          <span className="text-2xl font-bold text-zinc-50">
            {members.reduce((s, m) => s + m.totalShares, 0)}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col gap-1">
          <span className="text-xs text-zinc-500">🔓 Bai da mo</span>
          <span className="text-2xl font-bold text-zinc-50">
            {members.reduce((s, m) => s + m.unlockedDocs, 0)}
          </span>
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="text-center py-8 text-zinc-500">Dang tai...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl opacity-30">👥</span>
          <p className="text-zinc-500 mt-3">Chua co thanh vien nao</p>
          <p className="text-xs text-zinc-600 mt-1">Thanh vien se xuat hien khi nguoi dung share tai lieu len Facebook</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((m, i) => (
            <div
              key={m.userId ?? i}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm font-bold shrink-0">
                {(page - 1) * 20 + i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-200">
                    Thanh vien #{(page - 1) * 20 + i + 1}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatDate(m.firstSharedAt)}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {m.totalShares} luot share · {m.unlockedDocs} bai da mo
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 disabled:opacity-40"
          >
            ← Truoc
          </button>
          <span className="text-sm text-zinc-400">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
