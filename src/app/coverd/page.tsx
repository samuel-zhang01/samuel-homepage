import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "COVERD — Founder’s Desk",
  description:
    "COVERD is the AI interviewer that interviews the company first—using a role-specific belief graph to ask adaptive questions and produce cited evaluations.",
};

export default function CoverdPage() {
  return <SystemSevenDesktop initialApp="coverd" skipBoot />;
}
