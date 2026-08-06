"use client";

import { useEffect, useRef, useState } from "react";
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
  if (locale === "zh-CN") return `第 ${page} 页，共 ${total} 页`;
  if (locale === "zh-TW") return `第 ${page} 頁，共 ${total} 頁`;
  return `Page ${page} of ${total}`;
}

export default function PdfPreview({ src, title, locale }: PdfPreviewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [stageWidth, setStageWidth] = useState(640);
  const [status, setStatus] = useState<ReaderStatus>("loading");
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
    setPageNumber(1);
    setPageCount(0);
    setZoom(1);
    setError(false);
    setStatus("loading");

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
        setStatus("ready");
      } catch (loadError) {
        if (cancelled) return;
        console.error("PDF preview failed to load", loadError);
        setError(true);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      const loadingTask = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [src]);

  useEffect(() => {
    if (!documentProxy || !canvasRef.current) return;
    let cancelled = false;
    setStatus("rendering");

    void (async () => {
      try {
        renderTaskRef.current?.cancel();
        const page = await documentProxy.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;
        const naturalViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.max(0.25, (stageWidth - 28) / naturalViewport.width);
        const cssViewport = page.getViewport({ scale: fitScale * zoom });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: fitScale * zoom * pixelRatio });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;
        const renderTask = page.render({ canvas, viewport: renderViewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) setStatus("ready");
      } catch (renderError) {
        if (cancelled || (renderError instanceof Error && renderError.name === "RenderingCancelledException")) return;
        console.error("PDF preview failed to render", renderError);
        setError(true);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [documentProxy, pageNumber, stageWidth, zoom]);

  const statusText = status === "ready"
    ? formatPagePosition(locale, pageNumber, pageCount)
    : translateText(locale, status === "loading"
      ? "Loading document…"
      : status === "rendering"
        ? "Rendering page…"
        : "Preview unavailable");

  return (
    <div className="pdf-reader" data-status={status}>
      <div className="pdf-reader__controls" aria-label={translateText(locale, "Document reader controls")}>
        <button type="button" onClick={() => setPageNumber((page) => Math.max(1, page - 1))} disabled={pageNumber <= 1 || error}>{translateText(locale, "Previous page")}</button>
        <output aria-live="polite">{statusText}</output>
        <button type="button" onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))} disabled={pageNumber >= pageCount || error}>{translateText(locale, "Next page")}</button>
        <span className="pdf-reader__separator" aria-hidden="true" />
        <button type="button" aria-label={translateText(locale, "Zoom out")} onClick={() => setZoom((value) => Math.max(0.6, value - 0.2))} disabled={zoom <= 0.6 || error}>−</button>
        <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1 || error}>{Math.round(zoom * 100)}%</button>
        <button type="button" aria-label={translateText(locale, "Zoom in")} onClick={() => setZoom((value) => Math.min(2, value + 0.2))} disabled={zoom >= 2 || error}>+</button>
      </div>
      <div ref={stageRef} className="pdf-reader__stage" tabIndex={0} aria-label={`${title} ${translateText(locale, "document preview")}`}>
        {!error && <canvas ref={canvasRef} role="img" aria-label={`${title}, ${formatPagePosition(locale, pageNumber, pageCount || "…")}`} />}
        {error && <p className="pdf-reader__error">{translateText(locale, "The built-in preview could not render this file.")}</p>}
      </div>
    </div>
  );
}
