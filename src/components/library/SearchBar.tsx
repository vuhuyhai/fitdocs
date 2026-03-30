'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      startTransition(() => router.push(`/thu-vien?${params.toString()}`));
    },
    [value, router, searchParams],
  );

  const handleClear = useCallback(() => {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.push(`/thu-vien?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <span className="absolute left-3 text-zinc-500 pointer-events-none">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm tài liệu..."
        className="
          w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
          bg-zinc-900 border border-zinc-700 text-zinc-50
          placeholder:text-zinc-500
          focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50
          transition-colors
        "
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Xóa tìm kiếm"
        >
          ✕
        </button>
      )}
    </form>
  );
}
