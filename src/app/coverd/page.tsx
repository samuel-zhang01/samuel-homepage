import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "COVERD — Founder’s Desk",
  description:
    "COVERD is the AI interviewer that interviews the company first—learning the role before conducting natural candidate interviews with cited evaluations.",
};

export default function CoverdPage() {
  return <SystemSevenDesktop initialApp="coverd" skipBoot />;
}
