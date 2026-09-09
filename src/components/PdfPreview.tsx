"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";
import { capturePdfScrollAnchor, getPdfCurrentPage, getPdfPageWidth, getPdfReadingOffset, restorePdfScrollAnchor, type PdfPageGeometry, type PdfScrollAnchor } from "@/lib/pdfReaderGeometry";
import { translateText, type Locale } from "@/lib/i18n";

type PdfPreviewProps = {
  src: string;
  title: string;
  locale: Locale;
};

type ReaderStatus = "loading" | "rendering" | "ready" | "error";

function formatPagePosition(locale: Locale, page: number, total: number | string) {
  if (locale === "zh-CN") return `第 ${page} 页 / 共 ${total} 页`;
  if (locale === "zh-TW") return `第 ${page} 頁 / 共 ${total} 頁`;
  return `Page ${page} of ${total}`;
}

function PdfPage({
  documentProxy,
  pageNumber,
  stageRef,
  pageWidth,
  aspectRatio,
  title,
  locale,
  onRendered,
  onError,
}: {
  documentProxy: PDFDocumentProxy;
  pageNumber: number;
  stageRef: RefObject<HTMLDivElement | null>;
  pageWidth: number;
  aspectRatio: number;
  title: string;
  locale: Locale;
  onRendered: (page: number) => void;
  onError: () => void;
}) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [nearViewport, setNearViewport] = useState(pageNumber <= 2);
  const availableWidth = pageWidth;

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    const previousTask = renderTaskRef.current;
    previousTask?.cancel();

    void (async () => {
      try {
        // PDF.js must release a cancelled canvas before another render can use it.
        await previousTask?.promise.catch(() => {});
        if (cancelled) return;
        if (!nearViewport) { canvas.width = 1; canvas.height = 1; return; }
        const page = await documentProxy.getPage(pageNumber);
        if (cancelled) return;
        const naturalViewport = page.getViewport({ scale: 1 });
        const cssViewport = page.getViewport({ scale: availableWidth / naturalViewport.width });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: cssViewport.scale * pixelRatio });
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        canvas.style.width = `${availableWidth}px`;
        canvas.style.height = `${availableWidth * aspectRatio}px`;
        renderTask = page.render({ canvas, viewport: renderViewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) onRendered(pageNumber);
      } catch (renderError) {
        if (cancelled || (renderError instanceof Error && renderError.name === "RenderingCancelledException")) return;
        console.error(`PDF preview failed to render page ${pageNumber}`, renderError);
        onError();
      } finally {
        if (renderTask && renderTaskRef.current === renderTask) renderTaskRef.current = null;
      }
    })();

    return () => { cancelled = true; renderTask?.cancel(); };
  }, [availableWidth, aspectRatio, documentProxy, nearViewport, onError, onRendered, pageNumber]);

  return (
    <article
      ref={wrapperRef}
      className="pdf-reader__page"
      data-pdf-page={pageNumber}
      aria-label={`${title}, ${formatPagePosition(locale, pageNumber, documentProxy.numPages)}`}
      style={{ width: `${availableWidth}px`, height: `${availableWidth * aspectRatio}px` }}
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
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageRatios, setPageRatios] = useState<number[]>([]);
  const [stageMetrics, setStageMetrics] = useState({ width: 0, left: 0, right: 0, top: 0, gap: 18 });
  const metricsRef = useRef(stageMetrics);
  const geometryRef = useRef<PdfPageGeometry[]>([]);
  const pendingAnchor = useRef<{ vertical: PdfScrollAnchor; leftFraction: number } | null>(null);
  const pageWidth = getPdfPageWidth(stageMetrics.width, stageMetrics.left, stageMetrics.right, zoom) ?? 0;
  const geometry = useMemo(() => {
    let top = stageMetrics.top;
    return pageRatios.map((ratio, index) => {
      const page = { pageNumber: index + 1, top, height: pageWidth * ratio };
      top += page.height + stageMetrics.gap;
      return page;
    });
  }, [pageRatios, pageWidth, stageMetrics.top, stageMetrics.gap]);
  const rememberPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !stage.clientWidth || !geometryRef.current.length) return;
    const vertical = capturePdfScrollAnchor(geometryRef.current, stage.scrollTop, getPdfReadingOffset(stage.clientHeight));
    if (vertical) pendingAnchor.current = { vertical, leftFraction: stage.scrollLeft / Math.max(1, stage.scrollWidth) };
  }, []);
  const changeZoom = (next: number) => {
    const nextZoom = Math.max(.6, Math.min(2, Math.round(next * 10) / 10));
    if (nextZoom === zoom) return;
    rememberPosition();
    setZoom(nextZoom);
  };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    geometryRef.current = geometry;
    if (!stage || !pageWidth || !geometry.length || !stage.clientWidth) return;
    if (pendingAnchor.current) {
      stage.scrollTop = restorePdfScrollAnchor(geometry, pendingAnchor.current.vertical, stage.scrollHeight - stage.clientHeight);
      stage.scrollLeft = pendingAnchor.current.leftFraction * stage.scrollWidth;
      pendingAnchor.current = null;
    }
    setCurrentPage(getPdfCurrentPage(geometry, stage.scrollTop + getPdfReadingOffset(stage.clientHeight)));
  }, [geometry, pageWidth]);
  const [firstPageReady, setFirstPageReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateWidth = () => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      const css = window.getComputedStyle(stage);
      const next = { width: stage.clientWidth, left: parseFloat(css.paddingLeft) || 0, right: parseFloat(css.paddingRight) || 0, top: parseFloat(css.paddingTop) || 0, gap: parseFloat(css.getPropertyValue("--pdf-page-gap")) || 18 };
      if (Object.keys(next).every(key => metricsRef.current[key as keyof typeof next] === next[key as keyof typeof next])) {
        setCurrentPage(getPdfCurrentPage(geometryRef.current, stage.scrollTop + getPdfReadingOffset(stage.clientHeight)));
        return;
      }
      rememberPosition();
      metricsRef.current = next;
      setStageMetrics(next);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [rememberPosition]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    setDocumentProxy(null);
    setPageRatios([]);
    pendingAnchor.current = null;
    if (stageRef.current) { stageRef.current.scrollTop = 0; stageRef.current.scrollLeft = 0; }
    setPageCount(0);
    setCurrentPage(1);
    setZoom(1);
    setFirstPageReady(false);
    setError(false);

    void (async () => {
      try {
        // Load the pinned browser bundle natively. Sending PDF.js through the
        // current Next development-module wrapper corrupts its ESM namespace
        // before getDocument() runs. `prepare:pdfjs` copies this exact package
        // asset to same-origin public storage for both dev and production.
        const pdfJsUrl = "/_vendor/pdfjs/pdf.min.mjs";
        const pdfjs = await import(/* webpackIgnore: true */ pdfJsUrl) as typeof import("pdfjs-dist");
        if (cancelled) return;
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/_vendor/pdfjs/pdf.worker.min.mjs";
        }
        loadingTask = pdfjs.getDocument({
          url: src,
          isEvalSupported: false,
          enableXfa: false,
        });
        const loadedDocument = await loadingTask.promise;
        if (cancelled) {
          await loadedDocument.destroy();
          return;
        }
        // Resolve lightweight page geometry before mounting placeholders. Canvas
        // rendering remains visibility-based; portrait/landscape pages never reflow later.
        const ratios: number[] = [];
        for (let pageNumber = 1; pageNumber <= loadedDocument.numPages; pageNumber++) {
          const page = await loadedDocument.getPage(pageNumber);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1 });
          ratios.push(viewport.height / viewport.width);
        }
        setPageRatios(ratios);
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
      if (loadingTask) void loadingTask.destroy();
    };
  }, [src]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !documentProxy) return;
    let animationFrame = 0;
    const updateCurrentPage = () => {
      animationFrame = 0;
      if (!stage.clientWidth || !stage.clientHeight) return;
      setCurrentPage(getPdfCurrentPage(geometryRef.current, stage.scrollTop + getPdfReadingOffset(stage.clientHeight)));
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
  }, [documentProxy, geometry]);

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
  const statusText = error ? translateText(locale, "Preview unavailable") : documentProxy
    ? formatPagePosition(locale, currentPage, pageCount)
    : translateText(locale, "Loading document…");
  const fitLabel = locale === "zh-CN" ? "适合宽度" : locale === "zh-TW" ? "符合寬度" : "Fit width";
  const panHint = locale === "zh-CN" ? "横向滚动查看放大页面，或选择适合宽度。" : locale === "zh-TW" ? "橫向捲動查看放大的頁面，或選擇符合寬度。" : "Scroll sideways to read the enlarged page, or choose Fit width.";

  return (
    <div className="pdf-reader" data-status={status} data-zoomed={zoom > 1 || undefined}>
      <div className="pdf-reader__controls" aria-label={translateText(locale, "Document reader controls")}>
        <output aria-live="polite">{statusText}</output>
        <span className="pdf-reader__separator" aria-hidden="true" />
        <button type="button" aria-label={translateText(locale, "Zoom out")} onClick={() => changeZoom(zoom - .2)} disabled={zoom <= .6 || !documentProxy || error}>−</button>
        <button className="pdf-reader__fit" type="button" title={fitLabel} aria-label={`${fitLabel} (${Math.round(zoom * 100)}%)`} onClick={() => changeZoom(1)} disabled={!documentProxy || error}><span>{Math.round(zoom * 100)}%</span><small>{fitLabel}</small></button>
        <button type="button" aria-label={translateText(locale, "Zoom in")} onClick={() => changeZoom(zoom + .2)} disabled={zoom >= 2 || !documentProxy || error}>+</button>
      </div>
      <div ref={stageRef} className="pdf-reader__stage" tabIndex={0} aria-label={`${title} ${translateText(locale, "document preview")}`} aria-description={zoom > 1 ? panHint : undefined}>
        <div className="pdf-reader__pages" style={{ minWidth: pageWidth || undefined }}>
        {documentProxy && pageWidth > 0 && !error && Array.from({ length: pageCount }, (_, index) => (
          <PdfPage
            key={index + 1}
            documentProxy={documentProxy}
            pageNumber={index + 1}
            stageRef={stageRef}
            pageWidth={pageWidth}
            aspectRatio={pageRatios[index]}
            title={title}
            locale={locale}
            onRendered={handleRendered}
            onError={handleRenderError}
          />
        ))}
        </div>
        {!documentProxy && !error && <p className="pdf-reader__loading">{translateText(locale, "Loading document…")}</p>}
        {error && (
          <p className="pdf-reader__error">
            <span>{translateText(locale, "The built-in preview could not render this file.")}</span>
            <a href={src}>{translateText(locale, "Open this document in the current tab")}</a>
          </p>
        )}
      </div>
    </div>
  );
}
