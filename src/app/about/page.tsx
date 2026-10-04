import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/about", {
  title: "About Samuel Zhang",
  description:
    "My people, product, research and creative work in a System 7-inspired desktop.",
});

export default function AboutPage() {
  return <SystemSevenDesktop initialApp="about" skipBoot />;
}
