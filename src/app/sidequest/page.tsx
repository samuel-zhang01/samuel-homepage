import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "RUN/HACK — SideQuest",
  description:
    "Explore Samuel Zhang’s second-place Running Hackathon build: a voice-built social running loop with private Strava evidence, subsequent GPS runs, challenges and ephemeral live video.",
};

export default function SideQuestPage() {
  return <SystemSevenDesktop initialApp="sidequest" skipBoot />;
}
