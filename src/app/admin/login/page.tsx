'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!password) { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Mật khẩu không đúng');
        return;
      }
      toast.success('Đăng nhập thành công');
      const from = searchParams.get('from') ?? '/admin/dashboard';
      router.push(from);
      router.refresh();
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💪</div>
          <h1 className="text-2xl font-bold text-zinc-50">
            Fit<span className="text-violet-500">Docs</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Khu vực quản trị</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="font-semibold text-zinc-100 text-lg text-center">Đăng nhập</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Mật khẩu admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoFocus
              className={`
                w-full px-3 py-2.5 rounded-lg text-sm
                bg-zinc-800 border text-zinc-50
                placeholder:text-zinc-600
                focus:outline-none focus:ring-1 transition-colors
                ${error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                  : 'border-zinc-700 focus:border-violet-500 focus:ring-violet-500/50'
                }
              `}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
