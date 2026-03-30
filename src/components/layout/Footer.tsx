import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-violet-500">💪</span>
          <span className="font-medium text-zinc-400">FitDocs</span>
          <span>— Thư viện tài liệu Fitness</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/thu-vien" className="hover:text-zinc-300 transition-colors">Thư viện</Link>
          <span className="text-zinc-700">·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
