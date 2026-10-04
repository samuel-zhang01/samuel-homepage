import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/games", {
  title: "Desk Arcade",
  description: "Seven local-only profile, decision and science games inside my System 7 portfolio.",
});

export default function GamesPage() {
  return <SystemSevenDesktop initialApp="games" skipBoot />;
}
