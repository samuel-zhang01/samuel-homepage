import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samuel Zhang - Product Manager & AI Engineer",
  description: "Interactive portfolio showcasing Samuel Zhang's expertise in Product Management, AI/ML Engineering, Digital Consultancy, Analytical Chemistry, and Finance",
  keywords: ["Product Manager", "AI Engineer", "Digital Consultant", "Machine Learning", "Chemistry", "Finance", "Samuel Zhang"],
  authors: [{ name: "Samuel Zhang" }],
  openGraph: {
    title: "Samuel Zhang - Product Manager & AI Engineer",
    description: "Interactive portfolio showcasing expertise across technology and business domains",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen antialiased`}>
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
