"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";
import { translateText, type Locale } from "@/lib/i18n";

type PdfPreviewProps = {
  src: string;
  title: string;
  locale: Locale;
};

type ReaderStatus = "loading" | "rendering" | "ready" | "error";

function formatPagePosition(locale: Locale, page: number, total: number | string) {
  if (locale === "zh-CN") return `连续滚动 · 第 ${page} 页，共 ${total} 页`;
  if (locale === "zh-TW") return `連續捲動 · 第 ${page} 頁，共 ${total} 頁`;
  return `Continuous scroll · Page ${page} of ${total}`;
}

function PdfPage({
  documentProxy,
  pageNumber,
  stageRef,
  stageWidth,
  zoom,
  title,
  locale,
  onRendered,
  onError,
}: {
  documentProxy: PDFDocumentProxy;
  pageNumber: number;
  stageRef: RefObject<HTMLDivElement | null>;
  stageWidth: number;
  zoom: number;
  title: string;
  locale: Locale;
  onRendered: (page: number) => void;
  onError: () => void;
}) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [nearViewport, setNearViewport] = useState(pageNumber <= 2);
  const availableWidth = Math.max(220, stageWidth - 28) * zoom;
  const [aspectRatio, setAspectRatio] = useState(Math.SQRT2);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { root: stage, rootMargin: "120% 0px", threshold: 0.01 },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [stageRef]);

  useEffect(() => {
    if (!nearViewport || !canvasRef.current) return;
    let cancelled = false;
    let pageCleanup: (() => void) | null = null;

    void (async () => {
      try {
        const page = await documentProxy.getPage(pageNumber);
        pageCleanup = () => page.cleanup();
        if (cancelled || !canvasRef.current) return;

        const naturalViewport = page.getViewport({ scale: 1 });
        setAspectRatio(naturalViewport.height / naturalViewport.width);
        const fitScale = Math.max(0.25, availableWidth / naturalViewport.width);
        const cssViewport = page.getViewport({ scale: fitScale });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: fitScale * pixelRatio });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        renderTaskRef.current?.cancel();
        const renderTask = page.render({ canvas, viewport: renderViewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) onRendered(pageNumber);
      } catch (renderError) {
        if (cancelled || (renderError instanceof Error && renderError.name === "RenderingCancelledException")) return;
        console.error(`PDF preview failed to render page ${pageNumber}`, renderError);
        onError();
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      pageCleanup?.();
    };
  }, [availableWidth, documentProxy, nearViewport, onError, onRendered, pageNumber]);

  useEffect(() => {
    if (nearViewport || !canvasRef.current) return;
    canvasRef.current.width = 1;
    canvasRef.current.height = 1;
  }, [nearViewport]);

  return (
    <article
      ref={wrapperRef}
      className="pdf-reader__page"
      data-pdf-page={pageNumber}
      aria-label={`${title}, ${formatPagePosition(locale, pageNumber, documentProxy.numPages)}`}
      style={{ width: `${availableWidth}px`, minHeight: `${availableWidth * aspectRatio}px` }}
    >
      <span className="pdf-reader__page-number" aria-hidden="true">{pageNumber}</span>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${title}, ${formatPagePosition(locale, pageNumber, documentProxy.numPages)}`}
      />
    </article>
  );
}

export default function PdfPreview({ src, title, locale }: PdfPreviewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [stageWidth, setStageWidth] = useState(640);
  const [firstPageReady, setFirstPageReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateWidth = () => setStageWidth(Math.max(240, stage.clientWidth));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDocumentProxy(null);
    setPageCount(0);
    setCurrentPage(1);
    setZoom(1);
    setFirstPageReady(false);
    setError(false);

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
            import.meta.url,
          ).toString();
        }
        const loadingTask = pdfjs.getDocument({
          url: src,
          isEvalSupported: false,
          enableXfa: false,
        });
        loadingTaskRef.current = loadingTask;
        const loadedDocument = await loadingTask.promise;
        if (cancelled) {
          await loadedDocument.destroy();
          return;
        }
        setDocumentProxy(loadedDocument);
        setPageCount(loadedDocument.numPages);
      } catch (loadError) {
        if (cancelled) return;
        console.error("PDF preview failed to load", loadError);
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
      const loadingTask = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [src]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !documentProxy) return;
    let animationFrame = 0;
    const updateCurrentPage = () => {
      animationFrame = 0;
      const stageRect = stage.getBoundingClientRect();
      const readingLine = stageRect.top + Math.min(stageRect.height * 0.32, 180);
      let nearestPage = 1;
      let nearestDistance = Number.POSITIVE_INFINITY;
      stage.querySelectorAll<HTMLElement>("[data-pdf-page]").forEach((page) => {
        const distance = Math.abs(page.getBoundingClientRect().top - readingLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPage = Number(page.dataset.pdfPage) || 1;
        }
      });
      setCurrentPage(nearestPage);
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateCurrentPage);
    };
    updateCurrentPage();
    stage.addEventListener("scroll", requestUpdate, { passive: true });
    return () => {
      stage.removeEventListener("scroll", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [documentProxy, stageWidth, zoom]);

  const handleRendered = useCallback((page: number) => {
    if (page === 1) setFirstPageReady(true);
  }, []);
  const handleRenderError = useCallback(() => setError(true), []);

  const status: ReaderStatus = error
    ? "error"
    : !documentProxy
      ? "loading"
      : firstPageReady
        ? "ready"
        : "rendering";
  const statusText = documentProxy
    ? formatPagePosition(locale, currentPage, pageCount)
    : translateText(locale, error ? "Preview unavailable" : "Loading document…");

  return (
    <div className="pdf-reader" data-status={status}>
      <div className="pdf-reader__controls" aria-label={translateText(locale, "Document reader controls")}>
        <output aria-live="polite">{statusText}</output>
        <span className="pdf-reader__separator" aria-hidden="true" />
        <button type="button" aria-label={translateText(locale, "Zoom out")} onClick={() => setZoom((value) => Math.max(0.6, value - 0.2))} disabled={zoom <= 0.6 || error}>−</button>
        <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1 || error}>{Math.round(zoom * 100)}%</button>
        <button type="button" aria-label={translateText(locale, "Zoom in")} onClick={() => setZoom((value) => Math.min(2, value + 0.2))} disabled={zoom >= 2 || error}>+</button>
      </div>
      <div ref={stageRef} className="pdf-reader__stage" tabIndex={0} aria-label={`${title} ${translateText(locale, "document preview")}`}>
        {documentProxy && !error && Array.from({ length: pageCount }, (_, index) => (
          <PdfPage
            key={index + 1}
            documentProxy={documentProxy}
            pageNumber={index + 1}
            stageRef={stageRef}
            stageWidth={stageWidth}
            zoom={zoom}
            title={title}
            locale={locale}
            onRendered={handleRendered}
            onError={handleRenderError}
          />
        ))}
        {!documentProxy && !error && <p className="pdf-reader__loading">{translateText(locale, "Loading document…")}</p>}
        {error && <p className="pdf-reader__error">{translateText(locale, "The built-in preview could not render this file.")}</p>}
      </div>
    </div>
  );
}
