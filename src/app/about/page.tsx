import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "About Samuel Zhang",
  description:
    "Samuel Zhang's people, product, research and creative work in a System 7-inspired desktop.",
};

export default function AboutPage() {
  return <SystemSevenDesktop initialApp="about" skipBoot />;
}
