'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Tổng quan' },
  { href: '/admin/tai-lieu', icon: '📚', label: 'Tài liệu' },
  { href: '/admin/upload', icon: '⬆️', label: 'Tai len' },
  { href: '/admin/lo-trinh', icon: '🗺️', label: 'Lo trinh hoc' },
  { href: '/admin/analytics', icon: '🔗', label: 'Analytics' },
  { href: '/admin/thanh-vien', icon: '👥', label: 'Thanh vien' },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      toast.error('Đăng xuất thất bại');
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-base">
          <span className="text-violet-500">💪</span>
          <span className="text-zinc-50">
            Fit<span className="text-violet-500">Docs</span>
          </span>
          <span className="ml-auto text-xs font-normal text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Admin navigation">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              aria-current={active ? 'page' : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 btn-press
                ${active
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-600/30'
                  : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800'
                }
              `}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-1"
        >
          <span aria-hidden="true">🌐</span> Xem trang web
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Đăng xuất khỏi admin"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50 btn-press"
        >
          <span aria-hidden="true">🚪</span> {loggingOut ? 'Đang thoát...' : 'Đăng xuất'}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar when route changes on mobile
  const pathname = usePathname();
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile hamburger button ─────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Mở menu điều hướng"
        aria-expanded={mobileOpen}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
          <rect y="3" width="18" height="1.5" rx="1" />
          <rect y="8.25" width="18" height="1.5" rx="1" />
          <rect y="13.5" width="18" height="1.5" rx="1" />
        </svg>
      </button>

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Admin sidebar (mobile)"
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          ✕
        </button>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 min-h-screen"
        aria-label="Admin sidebar"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
