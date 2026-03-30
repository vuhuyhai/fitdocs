'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryTabsProps {
  categories: Category[];
  activeSlug: string;
}

export default function CategoryTabs({ categories, activeSlug }: CategoryTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === 'tat-ca') {
        params.delete('category');
      } else {
        params.set('category', slug);
      }
      params.delete('page');
      router.push(`/thu-vien?${params.toString()}`);
    },
    [router, searchParams],
  );

  const all = [{ id: 0, name: 'Tất cả', slug: 'tat-ca', icon: '📚' }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => {
        const active = cat.slug === activeSlug;
        return (
          <button
            key={cat.slug}
            onClick={() => handleSelect(cat.slug)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              border transition-colors shrink-0
              ${
                active
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-50 hover:border-zinc-600'
              }
            `}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
