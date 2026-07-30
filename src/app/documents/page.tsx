import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Document Viewer",
  description: "Read Samuel Zhang’s CV, research thesis, and product work without leaving the portfolio.",
};

export default function DocumentsPage() {
  return <SystemSevenDesktop initialApp="documents" skipBoot />;
}
