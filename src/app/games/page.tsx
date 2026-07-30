import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Games",
  description: "A tiny System 7 desk arcade inside Samuel Zhang’s interactive portfolio.",
};

export default function GamesPage() {
  return <SystemSevenDesktop initialApp="games" skipBoot />;
}
