import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Skills & Capabilities",
  description: "Technical, product, research and leadership capabilities, connected to the systems where Samuel Zhang has used them.",
};

export default function SkillsPage() {
  return <SystemSevenDesktop initialApp="skills" skipBoot />;
}
