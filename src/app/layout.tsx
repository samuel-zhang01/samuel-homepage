import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://me.samuelzhang.co.uk"),
  title: {
    default: "Samuel System 7 — Samuel Zhang",
    template: "%s · Samuel Zhang",
  },
  description:
    "The interactive portfolio of Samuel Zhang: applied AI researcher, product builder, founder of coverd.ai, and Imperial College London MSc student.",
  keywords: [
    "Samuel Zhang",
    "Artificial Intelligence",
    "Machine Learning",
    "Product Management",
    "coverd.ai",
    "Imperial College London",
    "Responsible AI",
  ],
  authors: [{ name: "Samuel Zhang" }],
  openGraph: {
    title: "Samuel System 7 — Samuel Zhang",
    description:
      "Explore Samuel Zhang's work, experience, and projects through a classic Macintosh-inspired desktop.",
    type: "website",
    url: "https://me.samuelzhang.co.uk",
  },
  twitter: {
    card: "summary",
    title: "Samuel System 7 — Samuel Zhang",
    description: "Applied AI researcher, product builder, and founder.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8587a8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
