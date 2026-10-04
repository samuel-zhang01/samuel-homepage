import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/orbitals", {
  title: "Orbital Lab",
  description: "Explore atomic orbitals in a fast, browser-local ASCII laboratory.",
});

export default function OrbitalLabPage() {
  return <SystemSevenDesktop initialApp="orbitals" skipBoot />;
}
