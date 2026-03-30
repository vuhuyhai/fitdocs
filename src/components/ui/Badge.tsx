type BadgeVariant = 'pdf' | 'video' | 'video-link' | 'article' | 'legacy' | 'category' | 'published' | 'draft' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  pdf: 'bg-red-500/15 text-red-400 border border-red-500/25',
  video: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  'video-link': 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  article: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  legacy: 'bg-zinc-700/50 text-zinc-500 border border-zinc-700',
  category: 'bg-zinc-700/50 text-zinc-300 border border-zinc-700',
  published: 'bg-green-500/15 text-green-400 border border-green-500/25',
  draft: 'bg-zinc-700/50 text-zinc-400 border border-zinc-700',
  default: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
};

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  video: 'Video',
  article: 'Bai viet',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}

export function FileTypeBadge({ type, videoSource }: { type: string; videoSource?: string }) {
  if (type === 'video' && videoSource === 'link') {
    return <Badge variant="video-link">Link</Badge>;
  }
  const variant: BadgeVariant =
    type === 'pdf' ? 'pdf' :
    type === 'video' ? 'video' :
    type === 'article' ? 'article' :
    'legacy';
  const label = FILE_TYPE_LABELS[type] ?? 'Legacy';
  return <Badge variant={variant}>{label}</Badge>;
}
