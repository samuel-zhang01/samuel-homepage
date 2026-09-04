import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Desk Accessories",
  description: "Eight everyday tools and a fast atomic-orbital lab, all in your browser.",
};

export default function DeskAccessoriesPage() {
  return <SystemSevenDesktop initialApp="desk" skipBoot />;
}
