import type { Metadata } from "next";
import { headers } from "next/headers";
import styles from "./not-found.module.css";

type NotFoundLocale = "en-GB" | "en-US" | "zh-CN" | "zh-TW";

const copy: Record<NotFoundLocale, {
  menu: string;
  file: string;
  edit: string;
  title: string;
  message: string;
  reason: string;
  hint: string;
  restart: string;
  projects: string;
  recovery: string;
}> = {
  "en-GB": {
    menu: "Finder",
    file: "File",
    edit: "Edit",
    title: "Sorry, a system error occurred.",
    message: "“Finder” could not find this item.",
    reason: "Error ID: 404 · File not found",
    hint: "The address may be incomplete, or the item may have moved to another folder.",
    restart: "Restart Finder",
    projects: "Look in Projects",
    recovery: "Recovery options",
  },
  "en-US": {
    menu: "Finder",
    file: "File",
    edit: "Edit",
    title: "Sorry, a system error occurred.",
    message: "“Finder” could not find this item.",
    reason: "Error ID: 404 · File not found",
    hint: "The address may be incomplete, or the item may have moved to another folder.",
    restart: "Restart Finder",
    projects: "Look in Projects",
    recovery: "Recovery options",
  },
  "zh-CN": {
    menu: "访达",
    file: "文件",
    edit: "编辑",
    title: "抱歉，发生了系统错误。",
    message: "“访达”找不到这个项目。",
    reason: "错误编号：404 · 文件未找到",
    hint: "地址可能不完整，或者这个项目已移到其他文件夹。",
    restart: "重新启动访达",
    projects: "在项目中查找",
    recovery: "恢复选项",
  },
  "zh-TW": {
    menu: "Finder",
    file: "檔案",
    edit: "編輯",
    title: "抱歉，發生了系統錯誤。",
    message: "“Finder”找不到這個項目。",
    reason: "錯誤編號：404 · 找不到檔案",
    hint: "網址可能不完整，或這個項目已移到其他檔案夾。",
    restart: "重新啟動 Finder",
    projects: "在專案中尋找",
    recovery: "復原選項",
  },
};

export const metadata: Metadata = {
  title: "Item Not Found",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const requested = (await headers()).get("x-samuel-locale");
  const locale: NotFoundLocale = requested === "en-US" || requested === "zh-CN" || requested === "zh-TW"
    ? requested
    : "en-GB";
  const c = copy[locale];
  const prefix = locale === "en-GB" ? "" : `/${locale.toLowerCase()}`;

  return (
    <main className={styles.desktop}>
      <header className={styles.menuBar} aria-label={c.menu}>
        <span className={styles.samuelMark} aria-hidden="true">S</span>
        <strong>{c.menu}</strong>
        <span>{c.file}</span>
        <span>{c.edit}</span>
        <span className={styles.menuSpacer} />
        <span>404</span>
      </header>

      <section className={styles.dialog} role="alertdialog" aria-labelledby="not-found-title" aria-describedby="not-found-description">
        <div className={styles.titleBar} aria-hidden="true">
          <span />
          <b>{c.menu}</b>
          <span />
        </div>
        <div className={styles.dialogBody}>
          <svg className={styles.bomb} viewBox="0 0 64 64" aria-hidden="true">
            <path d="M28 15h12v5h6v7h4v19h-4v7h-7v5H22v-4h-7v-7h-4V30h4v-7h7v-4h6z" fill="#111" />
            <path d="M38 14c2-8 8-8 12-10M44 11l7 2M48 7l4-4M21 31h5M35 31h5M25 43c4 3 8 3 12 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="square" />
            <path d="m11 13 5-5m-1 9 7-2m-9-5-4-5" fill="none" stroke="#111" strokeWidth="3" />
          </svg>
          <div className={styles.copy}>
            <h1 id="not-found-title">{c.title}</h1>
            <p id="not-found-description" className={styles.message}>{c.message}</p>
            <p className={styles.reason}>{c.reason}</p>
            <p className={styles.hint}>{c.hint}</p>
          </div>
        </div>
        <nav className={styles.actions} aria-label={c.recovery}>
          <a href={`${prefix}/projects`}>{c.projects}</a>
          <a className={styles.primary} href={`${prefix || "/"}`}>{c.restart}</a>
        </nav>
      </section>

      <p className={styles.footer}>SAMUEL SYSTEM 7 · FINDER ERROR −404</p>
    </main>
  );
}
