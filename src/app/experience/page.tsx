import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/experience", {
  title: "Experience",
  description: "My applied AI, product, research, teaching and public-service experience.",
});

export default function ExperiencePage() {
  return <SystemSevenDesktop initialApp="experience" skipBoot />;
}
