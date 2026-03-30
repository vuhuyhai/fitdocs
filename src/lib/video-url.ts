/** Video URL validation and embed URL generation for YouTube, Drive, Vimeo */

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

const DRIVE_PATTERN = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;

const VIMEO_PATTERNS = [
  /vimeo\.com\/(\d+)/,
  /player\.vimeo\.com\/video\/(\d+)/,
];

export type VideoProvider = 'youtube' | 'drive' | 'vimeo';

interface ParsedVideo {
  provider: VideoProvider;
  id: string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return { provider: 'youtube', id: match[1] };
  }

  const driveMatch = url.match(DRIVE_PATTERN);
  if (driveMatch) return { provider: 'drive', id: driveMatch[1] };

  for (const pattern of VIMEO_PATTERNS) {
    const match = url.match(pattern);
    if (match) return { provider: 'vimeo', id: match[1] };
  }

  return null;
}

export function getVideoEmbedUrl(url: string): string | null {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  switch (parsed.provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${parsed.id}?rel=0&modestbranding=1`;
    case 'drive':
      return `https://drive.google.com/file/d/${parsed.id}/preview`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${parsed.id}`;
  }
}

export function getVideoThumbnailUrl(url: string): string | null {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  switch (parsed.provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
    case 'drive':
      return `https://drive.google.com/thumbnail?id=${parsed.id}&sz=w400`;
    case 'vimeo':
      return null; // Vimeo requires oEmbed API call
  }
}

export function getVideoDomain(url: string): string {
  const parsed = parseVideoUrl(url);
  if (!parsed) return 'Link';
  switch (parsed.provider) {
    case 'youtube': return 'YouTube';
    case 'drive': return 'Google Drive';
    case 'vimeo': return 'Vimeo';
  }
}
