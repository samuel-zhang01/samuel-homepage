import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/lab", {
  title: "Home Lab",
  description: "A documented private-infrastructure inventory and source-audited six-service Compose exhibit.",
});

export default function LabPage() {
  return <SystemSevenDesktop initialApp="lab" skipBoot />;
}
