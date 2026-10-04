import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/skills", {
  title: "Skills & Capabilities",
  description: "Technical, product, research and leadership capabilities, connected to the systems where I have used them.",
});

export default function SkillsPage() {
  return <SystemSevenDesktop initialApp="skills" skipBoot />;
}
