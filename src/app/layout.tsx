import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { localeCvAssets, type Locale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://me.samuelzhang.co.uk"),
  applicationName: "Samuel System 7",
  title: {
    default: "Samuel System 7 — Samuel Zhang",
    template: "%s · Samuel Zhang",
  },
  description:
    "Samuel Zhang is an applied AI engineer, product builder and COVERD founder who builds useful, human-centred systems for ambiguous problems.",
  keywords: [
    "Samuel Zhang",
    "Artificial Intelligence",
    "Machine Learning",
    "Applied AI",
    "AI Product",
    "Multi-agent Systems",
    "Product Management",
    "COVERD",
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
      "Meet an applied AI engineer, product builder and COVERD founder—inside a playful classic Macintosh-inspired desktop.",
    type: "website",
    url: "https://me.samuelzhang.co.uk",
  },
  twitter: {
    card: "summary",
    title: "Samuel System 7 — Samuel Zhang",
    description: "Applied AI engineer, product builder and COVERD founder, presented as a tiny Macintosh desktop.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8587a8",
};

const localeBootstrap = `(()=>{try{const p=location.pathname.split('/')[1]?.toLowerCase();const q=new URLSearchParams(location.search).get('lang')?.toLowerCase();const s=localStorage.getItem('samuel-system7-locale')?.toLowerCase();const m={'en-gb':'en-GB','en-us':'en-US','zh-cn':'zh-CN','zh-hans':'zh-CN','zh-tw':'zh-TW','zh-hant':'zh-TW'};const l=m[p]||m[q]||m[s]||'en-GB';document.documentElement.lang=l;document.documentElement.dataset.locale=l}catch{}})()`;

const legacyBrowserCopy: Record<Locale, {
  notice: string;
  essentials: string;
  document: string;
  beforeDocument: string;
  betweenLinks: string;
  email: string;
  terminal: string;
}> = {
  "en-GB": {
    notice: "This interactive System 7 portfolio needs a modern browser.",
    essentials: "Internet Explorer can still access the essentials:",
    document: "read Samuel's CV",
    beforeDocument: " ",
    betweenLinks: " or ",
    email: "send an email",
    terminal: ".",
  },
  "en-US": {
    notice: "This interactive System 7 portfolio needs a modern browser.",
    essentials: "Internet Explorer can still access the essentials:",
    document: "read Samuel's resume",
    beforeDocument: " ",
    betweenLinks: " or ",
    email: "send an email",
    terminal: ".",
  },
  "zh-CN": {
    notice: "这个交互式 System 7 作品集需要现代浏览器。",
    essentials: "Internet Explorer 仍可访问基本内容：",
    document: "阅读 Samuel 的简历",
    beforeDocument: "",
    betweenLinks: "，或",
    email: "发送电子邮件",
    terminal: "。",
  },
  "zh-TW": {
    notice: "這個互動式 System 7 作品集需要現代瀏覽器。",
    essentials: "Internet Explorer 仍可存取基本內容：",
    document: "閱讀 Samuel 的履歷",
    beforeDocument: "",
    betweenLinks: "，或",
    email: "傳送電子郵件",
    terminal: "。",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestLocale = (await headers()).get("x-samuel-locale");
  const documentLocale = requestLocale === "en-US"
    || requestLocale === "zh-CN"
    || requestLocale === "zh-TW"
    ? requestLocale
    : "en-GB";
  const legacyCopy = legacyBrowserCopy[documentLocale];

  return (
    <html lang={documentLocale} suppressHydrationWarning>
      <head><script id="locale-bootstrap" dangerouslySetInnerHTML={{ __html: localeBootstrap }} /></head>
      <body>
        <div className="legacy-browser-notice" role="document">
          <h1>Samuel Zhang</h1>
          <p>{legacyCopy.notice}</p>
          <p>
            {legacyCopy.essentials}{legacyCopy.beforeDocument}<a href={localeCvAssets[documentLocale].src}>{legacyCopy.document}</a>{legacyCopy.betweenLinks}<a href="mailto:sam.xiaojian.zhang@outlook.com">{legacyCopy.email}</a>{legacyCopy.terminal}
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}
