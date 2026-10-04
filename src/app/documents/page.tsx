import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/documents", {
  title: "Documents",
  description: "Read my localised CV and reviewed learning material without leaving the portfolio.",
});

export default function DocumentsPage() {
  return <SystemSevenDesktop initialApp="documents" skipBoot />;
}
