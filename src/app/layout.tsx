import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://me.samuelzhang.co.uk"),
  applicationName: "Samuel System 7",
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
  creator: "Samuel Zhang",
  publisher: "Samuel Zhang",
  category: "portfolio",
  manifest: "/manifest.webmanifest?v=4",
  icons: {
    icon: [
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
      { url: "/favicon.ico?v=4", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/favicon.ico?v=4", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg?v=4",
        color: "#11177a",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Samuel System 7",
  },
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
