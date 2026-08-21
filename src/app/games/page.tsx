import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Desk Arcade",
  description: "Seven local-only profile, decision and science games inside Samuel Zhang’s System 7 portfolio.",
};

export default function GamesPage() {
  return <SystemSevenDesktop initialApp="games" skipBoot />;
}
