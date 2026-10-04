import Image from "next/image";
import { SYSTEM7_ICONS, type System7IconKind } from "@/lib/system7Icons";
import styles from "./System7Icon.module.css";

export type { System7IconKind } from "@/lib/system7Icons";

// The optional miniature flag is a sizing hint for existing callers, never a
// different drawing. Adjacent translated text names these decorative symbols.
export function System7Icon({ kind }: { kind: System7IconKind; miniature?: boolean }) {
  return <Image
    className={styles.icon}
    src={SYSTEM7_ICONS[kind]}
    data-system7-icon={kind}
    alt=""
    width={128}
    height={128}
    unoptimized
    aria-hidden="true"
  />;
}
