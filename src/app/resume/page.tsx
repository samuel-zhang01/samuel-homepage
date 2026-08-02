import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Résumé",
  description: "Samuel Zhang’s current applied AI résumé in an in-browser System 7 document.",
};

export default function ResumePage() {
  return <SystemSevenDesktop initialApp="resume" skipBoot />;
}
