import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "COVERD — Founder’s Desk",
  description:
    "COVERD is an ATS-connected recruitment-intelligence layer that reviews applications, retains evidence and returns reasoned shortlists while recruiters keep the decision.",
};

export default function CoverdPage() {
  return <SystemSevenDesktop initialApp="coverd" skipBoot />;
}
