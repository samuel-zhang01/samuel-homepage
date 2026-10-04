import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/interests", {
  title: "Interests & Notes",
  description: "Photography, music, hiking, teaching and the creative work behind Samuel Zhang’s technical portfolio.",
});

export default function InterestsPage() {
  return <SystemSevenDesktop initialApp="scrapbook" skipBoot />;
}
