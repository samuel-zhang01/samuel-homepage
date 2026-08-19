import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Home Lab",
  description: "A documented private-infrastructure inventory and source-audited six-service Compose exhibit.",
};

export default function LabPage() {
  return <SystemSevenDesktop initialApp="lab" skipBoot />;
}
