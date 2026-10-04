import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/settings", {
  title: "Settings",
  description: "Desktop appearance, language and comfort settings.",
});

export default function SettingsPage() {
  return <SystemSevenDesktop initialApp="settings" skipBoot />;
}
