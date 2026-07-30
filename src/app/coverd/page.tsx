import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "COVERD — Founder’s Desk",
  description:
    "The story, product system, and responsible-AI principles behind Samuel Zhang’s recruitment intelligence startup.",
};

export default function CoverdPage() {
  return <SystemSevenDesktop initialApp="coverd" skipBoot />;
}
