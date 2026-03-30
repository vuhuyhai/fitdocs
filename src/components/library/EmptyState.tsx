import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function EmptyState({
  title = 'Không có tài liệu',
  description = 'Chưa có tài liệu nào trong danh mục này.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="text-6xl opacity-40">📭</div>
      <div>
        <p className="font-semibold text-zinc-300 text-lg">{title}</p>
        <p className="text-zinc-500 text-sm mt-1 max-w-sm">{description}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
