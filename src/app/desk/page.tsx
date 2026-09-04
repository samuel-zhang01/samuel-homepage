import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Desk Accessories",
  description: "Eight private, browser-local tools for notes, drawing, planning, focus, calculations, conversions and colour inside Samuel Zhang’s System 7 desktop.",
};

export default function DeskAccessoriesPage() {
  return <SystemSevenDesktop initialApp="desk" skipBoot />;
}
