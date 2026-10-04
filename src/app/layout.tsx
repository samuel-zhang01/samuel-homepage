import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { localeCvAssets, localeOptions, type Locale } from "@/lib/i18n";
import { routeAlternates } from "@/lib/routeMetadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://me.samuelzhang.co.uk"),
  applicationName: "Samuel System 7",
  alternates: routeAlternates("/"),
  title: {
    default: "Samuel System 7 — Samuel Zhang",
    template: "%s · Samuel Zhang",
  },
  description:
    "I'm Samuel Zhang, an applied AI engineer and founder of COVERD. Here are the products, research projects and small tools I've built, with working demos where I can show them.",
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
  manifest: "/manifest.webmanifest?v=5",
  icons: {
    icon: [
      { url: "/favicon.png?v=5", sizes: "128x128", type: "image/png" },
      { url: "/favicon.ico?v=5", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/favicon.ico?v=5", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png?v=5", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg?v=5",
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
      "Samuel Zhang's products, research projects and small tools, laid out as a System 7 desktop.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Samuel System 7 — Samuel Zhang",
    description: "Samuel Zhang's products, research projects and small tools, laid out as a System 7 desktop.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8587a8",
};

const localeBootstrap = `(()=>{try{const p=location.pathname.split('/')[1]?.toLowerCase();const q=new URLSearchParams(location.search).get('lang')?.toLowerCase();const s=localStorage.getItem('samuel-system7-locale')?.toLowerCase();const m={'en-gb':'en-GB','en-us':'en-US','zh-cn':'zh-CN','zh-hans':'zh-CN','zh-tw':'zh-TW','zh-hant':'zh-TW'};const get=k=>Object.hasOwn(m,k)?m[k]:null;const l=get(p)||get(q)||get(s)||'en-GB';document.documentElement.lang=l;document.documentElement.dataset.locale=l}catch{}})()`;

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
    document: "read my CV",
    beforeDocument: " ",
    betweenLinks: " or ",
    email: "send an email",
    terminal: ".",
  },
  "en-US": {
    notice: "This interactive System 7 portfolio needs a modern browser.",
    essentials: "Internet Explorer can still access the essentials:",
    document: "read my resume",
    beforeDocument: " ",
    betweenLinks: " or ",
    email: "send an email",
    terminal: ".",
  },
  "zh-CN": {
    notice: "这个交互式 System 7 作品集需要现代浏览器。",
    essentials: "Internet Explorer 仍可访问基本内容：",
    document: "阅读我的简历",
    beforeDocument: "",
    betweenLinks: "，或",
    email: "发送电子邮件",
    terminal: "。",
  },
  "zh-TW": {
    notice: "這個互動式 System 7 作品集需要現代瀏覽器。",
    essentials: "Internet Explorer 仍可存取基本內容：",
    document: "閱讀我的履歷",
    beforeDocument: "",
    betweenLinks: "，或",
    email: "傳送電子郵件",
    terminal: "。",
  },
};

const noScriptCopy: Record<Locale, { notice: string; essentials: string; language: string }> = {
  "en-GB": {
    notice: "JavaScript is turned off. Enable it to explore the interactive System 7 desktop.",
    essentials: "You can still access the essentials:",
    language: "Choose a language",
  },
  "en-US": {
    notice: "JavaScript is turned off. Enable it to explore the interactive System 7 desktop.",
    essentials: "You can still access the essentials:",
    language: "Choose a language",
  },
  "zh-CN": {
    notice: "JavaScript 已关闭。启用后即可探索交互式 System 7 桌面。",
    essentials: "你仍可访问基本内容：",
    language: "选择语言",
  },
  "zh-TW": {
    notice: "JavaScript 已關閉。啟用後即可探索互動式 System 7 桌面。",
    essentials: "你仍可存取基本內容：",
    language: "選擇語言",
  },
};

const noScriptStyles = `
  html, body { overflow: auto !important; }
  body > :not(noscript):not([data-recovery-page]) { display: none !important; }
  body:has(> [data-recovery-page]) > noscript { display: none; }
  .no-js-notice { width: calc(100% - 32px); max-width: 680px; margin: 32px auto; padding: 24px; border: 3px double #111; color: #111; background: #fff; font: 16px/1.6 Geneva, Arial, sans-serif; }
  .no-js-notice h1 { margin-top: 0; }
  .no-js-notice a { color: #11177a; text-decoration: underline; }
  .no-js-notice a:focus-visible { outline: 2px solid #11177a; outline-offset: 3px; }
  .no-js-notice nav ul { display: flex; flex-wrap: wrap; gap: 8px 16px; list-style: none; padding: 0; }
  .no-js-notice nav a { display: inline-flex; align-items: center; min-height: 44px; }
`;

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
  const noJsCopy = noScriptCopy[documentLocale];

  return (
    <html lang={documentLocale} suppressHydrationWarning>
      <head><script id="locale-bootstrap" dangerouslySetInnerHTML={{ __html: localeBootstrap }} /></head>
      <body>
        <noscript>
          <style>{noScriptStyles}</style>
          <main className="no-js-notice">
            <h1>Samuel Zhang</h1>
            <p>{noJsCopy.notice}</p>
            <p>
              {noJsCopy.essentials}{legacyCopy.beforeDocument}<a href={localeCvAssets[documentLocale].src}>{legacyCopy.document}</a>{legacyCopy.betweenLinks}<a href="mailto:sam.xiaojian.zhang@outlook.com">{legacyCopy.email}</a>{legacyCopy.terminal}
            </p>
            <nav aria-label={noJsCopy.language}>
              <p>{noJsCopy.language}</p>
              <ul>{localeOptions.map(option => <li key={option.locale}><a href={`/${option.slug}`} lang={option.locale} aria-current={option.locale === documentLocale ? "page" : undefined}>{option.label}</a></li>)}</ul>
            </nav>
          </main>
        </noscript>
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
