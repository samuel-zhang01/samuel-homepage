import Image from "next/image";
import type { Project } from "@/data/projects";
import styles from "./ProjectArtwork.module.css";

const covers: Record<string, string> = {
  "microrobot-vision": "/project-art/microrobot.webp",
  "neural-cfd-surrogates": "/project-art/neural-cfd.webp",
  "ocean-depths-finance": "/project-art/finance.webp",
};

function ProjectSymbol({ slug, area }: { slug: string; area: Project["area"] }) {
  if (slug === "orbital-lab") return <><ellipse cx="24" cy="19" rx="9" ry="14" fill="#ffd56b" transform="rotate(-35 24 19)"/><ellipse cx="39" cy="42" rx="9" ry="14" fill="#8cbac6" transform="rotate(-35 39 42)"/><circle cx="32" cy="31" r="3" fill="#fff"/></>;
  if (slug.includes("note")) return <><path d="M15 9h29l7 7v39H15z" fill="#fff"/><path d="M43 9v9h8M21 25h23M21 31h23M21 37h23M21 43h16" fill="none"/></>;
  if (slug.includes("sketch")) return <><path d="M11 12h40v43H11z" fill="#fff"/><path d="m16 43 9-20 8 12 10-10" fill="none"/><path d="m30 45 17-29 6 4-17 29-8 4z" fill="#ffd56b"/></>;
  if (slug.includes("list")) return <><path d="M13 10h38v45H13z" fill="#fff"/><path d="m19 22 3 3 6-7m-9 16 3 3 6-7m-9 16 3 3 6-7M32 23h12M32 35h12M32 47h12" fill="none"/></>;
  if (slug.includes("calendar") || slug.includes("yasa")) return <><path d="M10 15h44v39H10z" fill="#fff"/><path d="M10 15h44v10H10z" fill="#df866c"/><path d="M21 10v10m22-10v10M18 33h6m7 0h6m7 0h4M18 42h6m7 0h6m7 0h4" fill="none"/></>;
  if (slug.includes("clock")) return <><circle cx="32" cy="33" r="23" fill="#fff"/><path d="M32 17v17l11 6M21 8l-8 7M43 8l8 7" fill="none"/></>;
  if (slug.includes("calculator")) return <><rect x="16" y="8" width="32" height="49" fill="#ddd"/><path d="M21 14h22v10H21z" fill="#fff"/><path d="M23 32h4m8 0h5M23 41h4m8 0h5M23 50h4m8 0h5" strokeWidth="4"/></>;
  if (slug.includes("colour")) return <><path d="M14 15h27v28H14z" fill="#e29476"/><path d="M28 24h26v28H28z" fill="#99b9cd"/><path d="M20 33h24v22H20z" fill="#e1c372"/></>;
  if (slug.includes("converter")) return <><path d="M11 18h35l-8-8m8 8-8 8M53 46H18l8-8m-8 8 8 8" fill="none"/><path d="M11 30h20v10H11zM35 27h18v11H35z" fill="#fff"/></>;
  if (slug.includes("mri")) return <><path d="M13 12h38v42H13z" fill="#ddd"/><ellipse cx="32" cy="32" rx="14" ry="18" fill="#111"/><path d="M32 24c-10-9-15 7 0 18 15-11 10-27 0-18" fill="#fff"/></>;
  if (slug.includes("finance") || slug.includes("market")) return <><path d="M11 12h31v40H11z" fill="#fff"/><path d="M17 20h19M17 28h19M17 36h12" fill="none"/><ellipse cx="43" cy="45" rx="12" ry="5" fill="#dfba60"/><path d="M31 45v8c0 7 24 7 24 0v-8" fill="#dfba60"/><path d="M31 49c0 7 24 7 24 0" fill="none"/></>;
  if (/molecular|spectroscopy|coding-series|thermodynamics|solubility/.test(slug)) return <><path d="m16 25 17-11 18 12-5 23-22 5-8-29" fill="none" strokeWidth="3"/><circle cx="16" cy="25" r="7" fill="#eee"/><circle cx="33" cy="14" r="7" fill="#b4cee0"/><circle cx="51" cy="26" r="7" fill="#eee"/><circle cx="46" cy="49" r="7" fill="#e4a376"/><circle cx="24" cy="54" r="7" fill="#eee"/></>;
  if (/insurance|safe|safety|cyber/.test(slug)) return <><path d="m32 7 23 9-3 24-20 18L12 40 9 16z" fill="#fff"/><path d="m20 31 9 9 17-19" fill="none" strokeWidth="4"/></>;
  if (/rl|decisions|regularisation|causal/.test(slug)) return <><path d="M10 11h43v43H10z" fill="#fff"/><path d="M22 11v43M34 11v43M10 25h43M10 39h43" stroke="#aaa"/><path d="m16 47 12-16 13 0 5-13" fill="none" strokeWidth="3"/><path d="m38 19 9-3 2 10" fill="none"/></>;
  if (area === "Systems") return <><path d="M11 10h42v13H11zM11 27h42v13H11zM11 44h42v13H11z" fill="#ddd"/><path d="M17 16h20M17 33h20M17 50h20"/><path d="M44 15h3v3h-3zM44 32h3v3h-3zM44 49h3v3h-3z" fill="#fff"/></>;
  if (area === "Education") return <><path d="M9 13c9-3 16-2 23 3 7-5 14-6 23-3v39c-9-3-16-2-23 2-7-4-14-5-23-2z" fill="#fff"/><path d="M32 16v38M15 23l11 2M15 31l11 2M38 25l11-2M38 33l11-2" fill="none"/></>;
  return <><path d="M8 17h19l5 6h24v32H8z" fill="#e4c979"/><path d="M8 25h48M18 34h27M18 42h19" fill="none"/><path d="m37 8 10 3 6 10-13 6-10-5z" fill="#fff"/></>;
}

export function ProjectArtwork({ project, compact = false }: { project: Project; compact?: boolean }) {
  const cover = covers[project.slug];
  return <div className={styles.artwork} data-compact={compact || undefined} data-area={project.area} aria-hidden="true">
    {cover ? <Image src={cover} alt="" width={320} height={320} sizes={compact ? "80px" : "(max-width: 620px) 80px, 160px"} />
      : <svg viewBox="0 0 64 64" shapeRendering="crispEdges" stroke="#111" strokeWidth="1.5" strokeLinejoin="miter"><ProjectSymbol slug={project.slug} area={project.area}/></svg>}
  </div>;
}
