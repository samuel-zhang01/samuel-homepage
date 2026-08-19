import { redirect } from "next/navigation";

export const metadata = {
  title: "CV",
  description: "Samuel Zhang’s current Applied AI CV.",
};

export default function ResumePage() {
  redirect("/documents");
}
