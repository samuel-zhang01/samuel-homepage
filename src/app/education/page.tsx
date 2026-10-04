import { sectionMetadata } from "@/lib/routeMetadata";
import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = sectionMetadata("/education", {
  title: "Education & Awards",
  description: "My education at Imperial and King’s, alongside awards and languages.",
});

export default function EducationPage() {
  return <SystemSevenDesktop initialApp="education" skipBoot />;
}
