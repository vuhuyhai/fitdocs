'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { DocType, VideoSource } from '@/lib/constants';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ACCEPT_MAP: Record<string, string> = {
  pdf: '.pdf',
  video: '.mp4,.mkv,.mov,.avi,.webm',
};

const CONTENT_TYPE_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  video: 'video/mp4',
};

const TYPE_CARDS: { type: DocType; icon: string; title: string; desc: string }[] = [
  { type: 'pdf', icon: '📄', title: 'PDF', desc: 'Sach, giao an, tai lieu' },
  { type: 'video', icon: '🎬', title: 'Video', desc: 'Clip, bai giang video' },
  { type: 'article', icon: '📝', title: 'Bai viet', desc: 'Article Markdown soan thao tay' },
];

interface FormState {
  title: string;
  description: string;
  categoryId: string;
  fileType: DocType;
  videoSource: VideoSource;
  videoUrl: string;
  content: string;
}

export default function UploadForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    categoryId: '',
    fileType: 'pdf',
    videoSource: 'upload',
    videoUrl: '',
    content: '',
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [videoValidated, setVideoValidated] = useState<{
    valid: boolean;
    embedUrl?: string;
    provider?: string;
    thumbnailUrl?: string;
    domain?: string;
  } | null>(null);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Tieu de khong duoc de trong';

    if (form.fileType === 'pdf') {
      if (!fileRef.current?.files?.[0]) errs.file = 'Vui long chon file PDF';
    } else if (form.fileType === 'video') {
      if (form.videoSource === 'upload' && !fileRef.current?.files?.[0]) {
        errs.file = 'Vui long chon file video';
      }
      if (form.videoSource === 'link' && !form.videoUrl.trim()) {
        errs.videoUrl = 'Vui long nhap URL video';
      }
      if (form.videoSource === 'link' && form.videoUrl.trim() && !videoValidated?.valid) {
        errs.videoUrl = 'Vui long xac minh URL truoc';
      }
    } else if (form.fileType === 'article') {
      if (!form.content.trim()) errs.content = 'Noi dung bai viet khong duoc de trong';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function uploadToS3(file: File, contentType: string): Promise<string> {
    const res = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, fileName: file.name }),
    });
    if (!res.ok) throw new Error('Khong lay duoc URL tai len');
    const { uploadUrl, key } = (await res.json()) as { uploadUrl: string; key: string };

    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
      };
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload that bai')));
      xhr.onerror = () => reject(new Error('Loi mang'));
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.send(file);
    });

    return key;
  }

  async function validateVideoUrl() {
    if (!form.videoUrl.trim()) {
      toast.error('Vui long nhap URL');
      return;
    }
    try {
      const res = await fetch('/api/admin/validate-video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.videoUrl }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setVideoValidated(data);
        setErrors((prev) => ({ ...prev, videoUrl: undefined }));
        toast.success(`URL hop le: ${data.domain}`);
      } else {
        setVideoValidated(null);
        setErrors((prev) => ({ ...prev, videoUrl: data.error || 'URL khong hop le' }));
        toast.error(data.error || 'URL khong hop le');
      }
    } catch {
      toast.error('Loi xac minh URL');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    setProgress(0);

    try {
      let fileKey: string | undefined;
      let thumbnailKey: string | undefined;
      let fileSize: number | undefined;

      // Upload file if needed
      const needsFileUpload =
        (form.fileType === 'pdf') ||
        (form.fileType === 'video' && form.videoSource === 'upload');

      if (needsFileUpload) {
        const file = fileRef.current!.files![0];
        fileSize = file.size;
        const ct = CONTENT_TYPE_MAP[form.fileType] || file.type;
        fileKey = await uploadToS3(file, ct);
        setProgress(90);
      }

      // Upload thumbnail if provided
      const thumbFile = thumbRef.current?.files?.[0];
      if (thumbFile) {
        thumbnailKey = await uploadToS3(thumbFile, thumbFile.type || 'image/jpeg');
      }
      setProgress(95);

      // Save metadata
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        fileType: form.fileType,
        isPublished: false,
      };

      if (fileKey) body.fileKey = fileKey;
      if (thumbnailKey) body.thumbnailKey = thumbnailKey;
      if (fileSize) body.fileSize = fileSize;

      if (form.fileType === 'video') {
        body.videoSource = form.videoSource;
        if (form.videoSource === 'link') {
          body.videoUrl = form.videoUrl;
        }
      }

      if (form.fileType === 'article') {
        body.content = form.content;
      }

      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Luu metadata that bai');
      setProgress(100);

      toast.success('Tai len thanh cong! Tai lieu dang o trang thai Ban nhap.');
      router.push('/admin/tai-lieu');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tai len that bai');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* File type selector — 3 cards */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-300">
          Loai tai lieu <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TYPE_CARDS.map((card) => (
            <button
              key={card.type}
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, fileType: card.type, videoSource: 'upload', videoUrl: '', content: '' }));
                setVideoValidated(null);
                setErrors({});
              }}
              className={`
                flex flex-col items-center gap-2 px-4 py-4 rounded-xl border text-center transition-colors
                ${form.fileType === card.type
                  ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500'
                }
              `}
            >
              <span className="text-2xl">{card.icon}</span>
              <span className="text-sm font-semibold">{card.title}</span>
              <span className="text-xs text-zinc-500">{card.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Tieu de"
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="Nhap tieu de tai lieu..."
        error={errors.title}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Mo ta</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Mo ta ngan ve noi dung tai lieu..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Danh muc</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
        >
          <option value="">-- Khong phan loai --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* ─── PDF: file upload ─── */}
      {form.fileType === 'pdf' && (
        <FileUploadField
          ref={fileRef}
          accept={ACCEPT_MAP.pdf}
          label="File PDF"
          error={errors.file}
        />
      )}

      {/* ─── Video: tabs upload / link ─── */}
      {form.fileType === 'video' && (
        <VideoSourceSection
          form={form}
          setForm={setForm}
          fileRef={fileRef}
          errors={errors}
          videoValidated={videoValidated}
          onValidate={validateVideoUrl}
        />
      )}

      {/* ─── Article: markdown content ─── */}
      {form.fileType === 'article' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            Noi dung bai viet <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Viet noi dung bang Markdown..."
            rows={12}
            className="w-full px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 resize-y font-mono"
          />
          {errors.content && <p className="text-xs text-red-400">{errors.content}</p>}
        </div>
      )}

      {/* Thumbnail upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">
          Anh thumbnail <span className="text-zinc-500 font-normal">(tuy chon)</span>
        </label>
        <input
          ref={thumbRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-zinc-700 file:text-zinc-300 file:bg-zinc-800 file:cursor-pointer hover:file:bg-zinc-700 file:transition-colors"
        />
      </div>

      {/* Progress */}
      {uploading && progress > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Dang tai len...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={uploading} size="lg">
          {uploading ? 'Dang tai len...' : 'Tai len'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()} disabled={uploading}>
          Huy
        </Button>
      </div>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

import { forwardRef } from 'react';

const FileUploadField = forwardRef<HTMLInputElement, { accept: string; label: string; error?: string }>(
  function FileUploadField({ accept, label, error }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">
          {label} <span className="text-red-400">*</span>
        </label>
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-zinc-700 file:text-zinc-300 file:bg-zinc-800 file:cursor-pointer hover:file:bg-zinc-700 file:transition-colors"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

function VideoSourceSection({
  form,
  setForm,
  fileRef,
  errors,
  videoValidated,
  onValidate,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  errors: Partial<Record<string, string>>;
  videoValidated: { valid: boolean; embedUrl?: string; provider?: string; domain?: string; thumbnailUrl?: string } | null;
  onValidate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700">
        {(['upload', 'link'] as VideoSource[]).map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, videoSource: src, videoUrl: '' }));
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              form.videoSource === src
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {src === 'upload' ? 'Tai len file' : 'Dan link ngoai'}
          </button>
        ))}
      </div>

      {form.videoSource === 'upload' && (
        <FileUploadField
          ref={fileRef}
          accept={ACCEPT_MAP.video}
          label="File Video"
          error={errors.file}
        />
      )}

      {form.videoSource === 'link' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">
            URL Video <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => {
                setForm((f) => ({ ...f, videoUrl: e.target.value }));
                setForm((f) => f); // trigger re-render
              }}
              placeholder="YouTube, Google Drive, Vimeo..."
              className={`flex-1 px-3 py-2 rounded-lg text-sm bg-zinc-900 border text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 ${
                errors.videoUrl ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-violet-500'
              }`}
            />
            <button
              type="button"
              onClick={onValidate}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
            >
              Xac minh
            </button>
          </div>
          {errors.videoUrl && <p className="text-xs text-red-400">{errors.videoUrl}</p>}

          {/* Validated preview */}
          {videoValidated?.valid && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <span className="text-green-400 text-lg">
                {videoValidated.provider === 'youtube' ? '▶' : videoValidated.provider === 'drive' ? '📁' : '🎬'}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-green-400 font-medium">{videoValidated.domain}</span>
                <span className="text-xs text-zinc-500 truncate max-w-[300px]">{videoValidated.embedUrl}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
