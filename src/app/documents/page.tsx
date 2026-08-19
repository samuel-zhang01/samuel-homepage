import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Documents",
  description: "Read Samuel Zhang’s localised CV and reviewed learning material without leaving the portfolio.",
};

export default function DocumentsPage() {
  return <SystemSevenDesktop initialApp="documents" skipBoot />;
}
