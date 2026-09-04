import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Orbital Lab",
  description: "Explore atomic orbitals in a fast, browser-local ASCII laboratory.",
};

export default function OrbitalLabPage() {
  return <SystemSevenDesktop initialApp="orbitals" skipBoot />;
}
