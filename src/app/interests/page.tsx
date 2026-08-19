import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Interests & Notes",
  description: "Photography, music, hiking, teaching and the creative work behind Samuel Zhang’s technical portfolio.",
};

export default function InterestsPage() {
  return <SystemSevenDesktop initialApp="scrapbook" skipBoot />;
}
