'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS, POPUP_POLL_INTERVAL_MS, POPUP_FALLBACK_TIMEOUT_MS } from '@/lib/constants';
import { colors } from '@/lib/design-tokens';
import { toastShareSuccess, toastShareError } from '@/lib/toast';

type UnlockState = 'loading' | 'locked' | 'unlocked';

interface ShareModalProps {
  documentId: number;
  documentTitle: string;
  fileType: string;
  shareUrl: string;
}

function launchConfetti() {
  const palette = colors.confetti as readonly string[];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const isCircle = Math.random() > 0.5;
    dot.style.cssText = `
      position:fixed;
      left:${Math.random() * 100}vw;
      top:-${size * 2}px;
      width:${size}px;height:${size}px;
      background:${palette[Math.floor(Math.random() * palette.length)]};
      border-radius:${isCircle ? '50%' : '2px'};
      animation:confetti-fall ${(Math.random() * 1.2 + 0.8).toFixed(2)}s ease-in forwards;
      animation-delay:${(Math.random() * 0.6).toFixed(2)}s;
      pointer-events:none;
      z-index:9999;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 2200);
  }
}

export default function ShareModal({ documentId, documentTitle, fileType, shareUrl }: ShareModalProps) {
  const [state, setState] = useState<UnlockState>('loading');
  const [sharing, setSharing] = useState(false);
  const mountedRef = useRef(true);
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Check unlock status on mount
  useEffect(() => {
    fetch(`/api/documents/${documentId}/unlock-status`)
      .then((r) => r.json())
      .then(({ unlocked }: { unlocked: boolean }) => {
        if (mountedRef.current) setState(unlocked ? 'unlocked' : 'locked');
      })
      .catch(() => { if (mountedRef.current) setState('locked'); });
  }, [documentId]);

  // Fire confetti once when transitioning to unlocked
  useEffect(() => {
    if (state === 'unlocked' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      launchConfetti();
    }
  }, [state]);

  const doUnlock = useCallback(async () => {
    try {
      const r = await fetch(`/api/documents/${documentId}/unlock`, { method: 'POST' });
      const data = await r.json() as { unlocked?: boolean };
      if (mountedRef.current && data.unlocked) {
        setState('unlocked');
        toastShareSuccess();
      }
    } catch {
      if (mountedRef.current) toastShareError();
    } finally {
      if (mountedRef.current) setSharing(false);
    }
  }, [documentId]);

  const handleShare = useCallback(() => {
    setSharing(true);

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent('Tài liệu Fitness hay — ' + documentTitle)}`;
    const popup = window.open(fbUrl, 'fb-share', 'width=600,height=500,scrollbars=yes,resizable=yes');

    let unlocked = false;

    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        clearTimeout(fallback);
        if (!unlocked) { unlocked = true; doUnlock(); }
      }
    }, POPUP_POLL_INTERVAL_MS);

    const fallback = setTimeout(() => {
      clearInterval(timer);
      if (!unlocked) { unlocked = true; doUnlock(); }
    }, POPUP_FALLBACK_TIMEOUT_MS);

    return () => {
      clearInterval(timer);
      clearTimeout(fallback);
    };
  }, [shareUrl, documentTitle, doUnlock]);

  if (state === 'loading') {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex items-center justify-center gap-3 text-zinc-500 text-sm">
        <span className="animate-spin">⏳</span> Đang kiểm tra...
      </div>
    );
  }

  if (state === 'unlocked') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{FILE_TYPE_ICONS[fileType] ?? '📄'}</span>
          <div>
            <p className="font-semibold text-green-400">🔓 Tài liệu đã được mở khóa!</p>
            <p className="text-sm text-zinc-400">Cảm ơn bạn đã chia sẻ</p>
          </div>
        </div>

        <Link
          href={`/tai-lieu/${documentId}/view`}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors btn-press"
        >
          <span>{FILE_TYPE_ICONS[fileType] ?? '📄'}</span>
          <span>Xem {FILE_TYPE_LABELS[fileType] ?? 'tài liệu'}</span>
        </Link>

        <p className="text-xs text-zinc-600 text-center">
          Xem trực tuyến — không thể tải về
        </p>
      </div>
    );
  }

  // Locked state
  return (
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{FILE_TYPE_ICONS[fileType] ?? '📄'}</div>
        <div>
          <p className="font-semibold text-zinc-100">Xem tài liệu {FILE_TYPE_LABELS[fileType] ?? ''}</p>
          <p className="text-sm text-zinc-400">Chia sẻ lên Facebook để mở khóa miễn phí</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-400">
        <span>🔒</span>
        <span>Tài liệu đang bị khóa — Chia sẻ để mở khóa</span>
      </div>

      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed btn-press ${
          !sharing ? 'pulse-ring' : ''
        }`}
      >
        {sharing ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <span>📘</span>
            <span>Chia sẻ lên Facebook để xem</span>
          </>
        )}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        Chỉ cần chia sẻ một lần — lần sau xem lại không cần chia sẻ nữa
      </p>
    </div>
  );
}
