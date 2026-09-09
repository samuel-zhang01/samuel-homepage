/** Resolve the canvas's CSS surface once when creating a renderer. */
export function canvasBackground(canvas: HTMLCanvasElement) {
  const css = getComputedStyle(canvas).backgroundColor;
  // Shared surface tokens resolve to opaque sRGB colours in computed styles.
  const match = css.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  const rgb: [number, number, number] = match
    ? [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255]
    : [1, 1, 1];
  return { css: match ? css : "#fff", rgb };
}
