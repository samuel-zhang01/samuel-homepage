import Image from "next/image";
import { SYSTEM7_ICONS, type System7IconKind } from "@/lib/system7Icons";
import { SYSTEM7_ICON_BOUNDS } from "@/lib/system7IconBounds";
import styles from "./System7Icon.module.css";

export type { System7IconKind } from "@/lib/system7Icons";

// The optional miniature flag is a sizing hint for existing callers, never a
// different drawing. Adjacent translated text names these decorative symbols.
export function System7Icon({ kind }: { kind: System7IconKind; miniature?: boolean }) {
  const [left, top, right, bottom, canvas] = SYSTEM7_ICON_BOUNDS[kind];
  const scale = .9 * canvas / Math.max(right - left + 1, bottom - top + 1);
  const x = 50 - (left + right + 1) / (2 * canvas) * scale * 100;
  const y = 50 - (top + bottom + 1) / (2 * canvas) * scale * 100;
  return <span className={styles.frame} data-system7-frame={kind} data-brand={kind === "coverd" || undefined} aria-hidden="true"><Image
    className={styles.icon}
    style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, left: `${x}%`, top: `${y}%` }}
    src={SYSTEM7_ICONS[kind]}
    data-system7-icon={kind}
    alt=""
    width={canvas}
    height={canvas}
    unoptimized
    aria-hidden="true"
  /></span>;
}
