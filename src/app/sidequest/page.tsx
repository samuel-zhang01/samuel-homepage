import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "RUN/HACK — Running Hackathon Field Journal",
  description:
    "Step inside Samuel Zhang’s rain-soaked Running Hackathon relay: 44 team kilometres, a runner-only build rule, the people behind the track and second-place app SideQuest.",
};

export default function SideQuestPage() {
  return <SystemSevenDesktop initialApp="sidequest" skipBoot />;
}
