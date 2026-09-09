/** Page rectangles use the scrollable document's coordinate system. */
export type PdfPageGeometry = {
  pageNumber: number;
  top: number;
  height: number;
};

export type PdfScrollAnchor = {
  pageNumber: number;
  fraction: number;
  viewportOffset: number;
  atStart: boolean;
};

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Ignore hidden readers; their last usable layout must survive window switching. */
export function getPdfPageWidth(clientWidth: number, paddingLeft: number, paddingRight: number, zoom: number): number | null {
  if (![clientWidth, paddingLeft, paddingRight, zoom].every(Number.isFinite) || clientWidth <= 0 || zoom <= 0) return null;
  const contentWidth = clientWidth - Math.max(0, paddingLeft) - Math.max(0, paddingRight);
  return contentWidth > 0 ? contentWidth * zoom : null;
}

export function getPdfReadingOffset(viewportHeight: number): number {
  return Number.isFinite(viewportHeight) ? Math.min(48, Math.max(0, viewportHeight) * 0.12) : 0;
}

function pageAtLine(pages: readonly PdfPageGeometry[], readingLine: number): PdfPageGeometry | undefined {
  let current = pages[0];
  for (const page of pages) {
    if (page.top > readingLine) break;
    current = page;
  }
  return current;
}

/** A following page does not become current until its top crosses the reading line. */
export function getPdfCurrentPage(pages: readonly PdfPageGeometry[], readingLine: number): number {
  return pageAtLine(pages, readingLine)?.pageNumber ?? 1;
}

/** Retain the exact part of the page being read, even with mixed page sizes. */
export function capturePdfScrollAnchor(pages: readonly PdfPageGeometry[], scrollTop: number, readingOffset = 0): PdfScrollAnchor | null {
  const readingLine = scrollTop + readingOffset;
  const page = pageAtLine(pages, readingLine);
  if (!page || page.height <= 0) return null;
  const fraction = clamp((readingLine - page.top) / page.height, 0, 1);
  return {
    pageNumber: page.pageNumber,
    fraction,
    viewportOffset: page.top + fraction * page.height - scrollTop,
    atStart: scrollTop <= 0,
  };
}

export function restorePdfScrollAnchor(pages: readonly PdfPageGeometry[], anchor: PdfScrollAnchor, maxScrollTop: number): number {
  if (anchor.atStart) return 0;
  const page = pages.find((item) => item.pageNumber === anchor.pageNumber);
  if (!page) return 0;
  return clamp(page.top + page.height * anchor.fraction - anchor.viewportOffset, 0, Math.max(0, maxScrollTop));
}
