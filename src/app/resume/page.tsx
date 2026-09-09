import { redirect } from "next/navigation";

export const metadata = {
  title: "CV",
  description: "My current Applied AI CV.",
};

export default function ResumePage() {
  redirect("/documents");
}
