'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use CDN worker — avoids webpack complexity with pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  documentId: number;
}

export default function PdfViewer({ documentId }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [inputPage, setInputPage] = useState('1');

  const pdfUrl = `/api/documents/${documentId}/content`;

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setInputPage('1');
  }, []);

  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(page, numPages));
    setPageNumber(clamped);
    setInputPage(String(clamped));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageInputBlur = () => {
    const n = parseInt(inputPage, 10);
    if (!isNaN(n)) goTo(n);
    else setInputPage(String(pageNumber));
  };

  const handlePageInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handlePageInputBlur();
  };

  const zoomSteps = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const zoomIn = () => setScale((s) => Math.min(2.0, zoomSteps.find((z) => z > s) ?? 2.0));
  const zoomOut = () => setScale((s) => Math.max(0.5, [...zoomSteps].reverse().find((z) => z < s) ?? 0.5));

  const toggleFullscreen = () => {
    const el = document.getElementById('pdf-viewer-container');
    if (!document.fullscreenElement) el?.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div
      id="pdf-viewer-container"
      className="flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900 flex-wrap">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goTo(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang trước"
          >
            ←
          </button>
          <div className="flex items-center gap-1 text-sm text-zinc-400">
            <input
              type="text"
              value={inputPage}
              onChange={handlePageInput}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKey}
              className="w-10 text-center bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-zinc-100 text-xs focus:outline-none focus:border-violet-500"
              aria-label="Số trang"
            />
            <span>/ {numPages || '—'}</span>
          </div>
          <button
            onClick={() => goTo(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang sau"
          >
            →
          </button>
        </div>

        <div className="w-px h-4 bg-zinc-700 mx-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Thu nhỏ"
          >
            −
          </button>
          <span className="text-xs text-zinc-400 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Phóng to"
          >
            +
          </button>
        </div>

        <div className="flex-1" />

        {/* Watermark badge */}
        <span className="text-xs text-zinc-600 hidden sm:block">FitDocs — Chỉ xem, không tải về</span>

        <button
          onClick={toggleFullscreen}
          className="px-2 py-1 rounded text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Toàn màn hình"
        >
          ⛶
        </button>
      </div>

      {/* Scroll progress bar */}
      <div className="h-0.5 bg-zinc-800" aria-hidden="true">
        <div
          className="pdf-progress-bar h-full"
          style={{ width: numPages > 1 ? `${((pageNumber - 1) / (numPages - 1)) * 100}%` : pageNumber >= 1 ? '100%' : '0%' }}
        />
      </div>

      {/* PDF Canvas */}
      <div className="overflow-auto flex-1 flex justify-center py-4 bg-zinc-950 min-h-[500px]">
        <div className="relative">
          {/* Watermark overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-5"
            style={{ userSelect: 'none' }}
            aria-hidden
          >
            <span
              className="text-white font-bold whitespace-nowrap"
              style={{ fontSize: `${scale * 80}px`, transform: 'rotate(-30deg)' }}
            >
              FitDocs
            </span>
          </div>

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64 text-zinc-500 text-sm gap-2">
                <span className="animate-spin">⏳</span> Đang tải PDF...
              </div>
            }
            error={
              <div className="flex items-center justify-center h-64 text-red-400 text-sm">
                Không thể tải file PDF
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 text-center text-xs text-zinc-700 border-t border-zinc-800 bg-zinc-900">
        Tài liệu được bảo vệ bởi FitDocs — Không sao chép hoặc tải về
      </div>
    </div>
  );
}
