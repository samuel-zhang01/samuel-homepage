import Image from "next/image";
import styles from "./System7Icon.module.css";

export type System7IconKind =
  | "profile" | "computer" | "briefcase" | "folder" | "document" | "controls"
  | "university" | "network" | "photos" | "runner" | "game" | "accessories"
  | "note" | "sketch" | "tasks" | "clock" | "calendar" | "calculator"
  | "converter" | "palette" | "orbital" | "pdf" | "mail" | "secret"
  | "minefield" | "snake" | "brickbreaker" | "cards" | "puzzle" | "word" | "spectrum"
  | "microscope" | "finance" | "chart" | "molecule" | "shield" | "book" | "mri" | "flow";

// Generated PNGs and the companion SVGs share the same small-pixel palette.
// Symbols stay decorative: the adjacent translated text names their action.
const paintedIcons = new Set<System7IconKind>(["folder", "microscope", "computer", "finance", "mri", "network", "molecule", "minefield", "snake", "brickbreaker", "cards"]);

export function System7Icon({ kind, miniature = false }: { kind: System7IconKind; miniature?: boolean }) {
  return <Image
    className={styles.icon}
    src={`/system7-icons/${kind === "secret" ? "star" : kind}.${!miniature && paintedIcons.has(kind) ? "png" : "svg"}`}
    alt=""
    width={64}
    height={64}
    unoptimized
    aria-hidden="true"
  />;
}
