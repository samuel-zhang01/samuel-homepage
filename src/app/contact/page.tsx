import SystemSevenDesktop from "@/components/SystemSevenDesktop";

export const metadata = {
  title: "Contact Samuel Zhang",
  description: "Contact Samuel Zhang by email, LinkedIn or GitHub from the System 7 portfolio.",
};

export default function ContactPage() {
  return <SystemSevenDesktop initialApp="contact" skipBoot />;
}
