/** Shared constants — single source of truth for all modules */

// ─── File Type Metadata ────────────────────────────────────────────────────
export type DocType = 'pdf' | 'video' | 'article';
export type VideoSource = 'upload' | 'link';

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  video: '🎬',
  article: '📝',
  docx: '📝', // legacy
};

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  video: 'Video',
  article: 'Bai viet',
  docx: 'DOCX', // legacy
};

export const FILE_CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  video: 'video/mp4',
};

// ─── Pagination ────────────────────────────────────────────────────────────
export const DOCUMENTS_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

// ─── Analytics ────────────────────────────────────────────────────────────
export const MAX_ANALYTICS_DAYS = 30;

// ─── S3 ───────────────────────────────────────────────────────────────────
export const S3_PRESIGNED_TTL_SECONDS = 900; // 15 min

export const S3_FOLDERS = {
  thumbnails: 'thumbs',
  documents: 'docs',
  videos: 'videos',
} as const;

// ─── Share-to-Unlock ──────────────────────────────────────────────────────
export const POPUP_POLL_INTERVAL_MS = 500;
export const POPUP_FALLBACK_TIMEOUT_MS = 10_000;
