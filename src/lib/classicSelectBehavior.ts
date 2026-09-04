export type SelectChoice = { value: string; label: string; disabled?: boolean; group?: string; lang?: string };

/** Move through enabled options without ever landing on a disabled item. */
export function nextSelectOption(options: readonly SelectChoice[], current: number, direction: 1 | -1) {
  for (let step = 1; step <= options.length; step += 1) {
    const index = ((current + direction * step) % options.length + options.length) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}

export function matchSelectOption(options: readonly SelectChoice[], query: string, current: number) {
  const fold = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase();
  const normalized = fold(query);
  for (let step = 1; step <= options.length; step += 1) {
    const index = (Math.max(current, -1) + step) % options.length;
    if (!options[index].disabled && fold(options[index].label).startsWith(normalized)) return index;
  }
  return -1;
}

/** Fixed, viewport-bounded placement; the menu itself supplies its scroll area. */
export function selectMenuPlacement(rect: { left: number; top: number; bottom: number; width: number }, viewport: { width: number; height: number }, desiredHeight: number) {
  const inset = 8;
  const width = Math.min(Math.max(rect.width, 160), Math.max(0, viewport.width - inset * 2));
  const below = Math.max(0, viewport.height - rect.bottom - inset - 2);
  const above = Math.max(0, rect.top - inset - 2);
  const flipped = below < Math.min(desiredHeight, 180) && above > below;
  const maxHeight = Math.min(320, flipped ? above : below);
  const height = Math.min(desiredHeight, maxHeight);
  return {
    left: Math.max(inset, Math.min(rect.left, viewport.width - width - inset)),
    top: flipped ? rect.top - height - 2 : rect.bottom + 2,
    width,
    maxHeight,
  };
}
