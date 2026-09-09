import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/pdfReaderGeometry.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const {
  getPdfPageWidth, getPdfReadingOffset, getPdfCurrentPage,
  capturePdfScrollAnchor, restorePdfScrollAnchor,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

let checks = 0;
function check(name, callback) { callback(); checks += 1; console.log(`PASS ${name}`); }
const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.00001, `${actual} should equal ${expected}`);

check("Fit width accommodates the actual desktop/mobile padding, small windows, and zoom", () => {
  assert.equal(getPdfPageWidth(640, 14, 14, 1), 612);
  assert.equal(getPdfPageWidth(288, 8, 8, 1), 272);
  assert.equal(getPdfPageWidth(180, 8, 8, 1), 164);
  closeTo(getPdfPageWidth(288, 8, 8, 1.2), 326.4);
  assert.equal(getPdfPageWidth(288, 8, 16, 1), 264);
});

check("Hidden windows cannot substitute a minimum width and reflow the reader", () => {
  for (const width of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(getPdfPageWidth(width, 8, 8, 1), null);
  }
  assert.equal(getPdfPageWidth(16, 8, 8, 1), null);
  assert.equal(getPdfPageWidth(300, 8, 8, 0), null);
});

const pages = [
  { pageNumber: 1, top: 8, height: 200 },
  { pageNumber: 2, top: 226, height: 600 },
  { pageNumber: 3, top: 844, height: 300 },
];
check("The page counter identifies the page being read, not the nearest page heading", () => {
  assert.equal(getPdfCurrentPage(pages, 0), 1);
  assert.equal(getPdfCurrentPage(pages, 180), 1, "The old nearest-top rule reported page 2");
  assert.equal(getPdfCurrentPage(pages, 208), 1);
  assert.equal(getPdfCurrentPage(pages, 225), 1, "A gap must not announce the next page early");
  assert.equal(getPdfCurrentPage(pages, 226), 2);
  assert.equal(getPdfCurrentPage(pages, 800), 2);
  assert.equal(getPdfCurrentPage(pages, 844), 3);
  assert.equal(getPdfCurrentPage(pages, 1200), 3);
  assert.equal(getPdfCurrentPage([], 0), 1);
});

check("Reading position stays near the top on both short mobile and tall desktop readers", () => {
  assert.equal(getPdfReadingOffset(200), 24);
  assert.equal(getPdfReadingOffset(1000), 48);
  assert.equal(getPdfReadingOffset(0), 0);
});

const enlargedPages = [
  { pageNumber: 1, top: 8, height: 400 },
  { pageNumber: 2, top: 426, height: 1200 },
  { pageNumber: 3, top: 1644, height: 600 },
];
check("Zoom preserves the same passage across portrait and landscape pages with fixed gaps", () => {
  // The reading line is halfway down page 2 at 526; it must stay 40px below the viewport top.
  const anchor = capturePdfScrollAnchor(pages, 486, 40);
  assert.equal(anchor.pageNumber, 2);
  assert.equal(anchor.fraction, 0.5);
  assert.equal(restorePdfScrollAnchor(enlargedPages, anchor, 2000), 986);
  const restoredAnchor = capturePdfScrollAnchor(enlargedPages, 986, 40);
  assert.deepEqual(restoredAnchor, anchor);
  assert.equal(restorePdfScrollAnchor(pages, restoredAnchor, 1000), 486);
});

check("Top-of-document zoom, page gaps, and a viewport taller than the file stay in bounds", () => {
  const topAnchor = capturePdfScrollAnchor(pages, 0, 48);
  assert.equal(restorePdfScrollAnchor(enlargedPages, topAnchor, 2000), 0);
  const gapAnchor = capturePdfScrollAnchor(pages, 215);
  assert.equal(restorePdfScrollAnchor(enlargedPages, gapAnchor, 2000), 415);
  const lastPageAnchor = capturePdfScrollAnchor(pages, 1000, 40);
  assert.equal(restorePdfScrollAnchor(enlargedPages, lastPageAnchor, 1500), 1500);
  assert.equal(restorePdfScrollAnchor(enlargedPages, lastPageAnchor, 0), 0);
  assert.equal(capturePdfScrollAnchor([], 0), null);
});

console.log(`${checks} PDF reader geometry checks passed.`);
