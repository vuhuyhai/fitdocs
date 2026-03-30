'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks = [
  { href: '/', label: 'Trang chu' },
  { href: '/thu-vien', label: 'Thu vien' },
  { href: '/lo-trinh', label: 'Lo trinh' },
];

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="text-violet-500" aria-hidden="true">💪</span>
          <span className="text-zinc-50">
            Fit<span className="text-violet-500">Docs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors btn-press ${
                  active
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors btn-press"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* CTA */}
          <Link
            href="/thu-vien"
            className="hidden sm:block px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors btn-press"
          >
            Khám phá
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
          >
            {mobileOpen ? (
              <span aria-hidden="true" className="text-lg leading-none">✕</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                <rect y="3" width="18" height="1.5" rx="1" />
                <rect y="8.25" width="18" height="1.5" rx="1" />
                <rect y="13.5" width="18" height="1.5" rx="1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex flex-col gap-1"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/thu-vien"
            className="mt-1 px-3 py-2.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white text-center transition-colors"
          >
            Khám phá thư viện
          </Link>
        </div>
      )}
    </header>
  );
}
