"use client";

import { Component, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  "en-GB": { title: "This application could not open", detail: "Your other desktop windows are still available. Check your connection, then reload the page to try again.", action: "Reload page" },
  "en-US": { title: "This application could not open", detail: "Your other desktop windows are still available. Check your connection, then reload the page to try again.", action: "Reload page" },
  "zh-CN": { title: "无法打开此应用", detail: "其他桌面窗口仍可使用。请检查网络连接，再重新加载页面。", action: "重新加载页面" },
  "zh-TW": { title: "無法開啟此應用程式", detail: "其他桌面視窗仍可使用。請檢查網路連線，再重新載入頁面。", action: "重新載入頁面" },
};

export class WindowErrorBoundary extends Component<{ locale: Locale; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const text = copy[this.props.locale];
    return <section className="system7-project window-load-error" role="alert" lang={this.props.locale}>
      <h2>{text.title}</h2><p>{text.detail}</p>
      <button type="button" className="s7-button" onClick={() => window.location.reload()}>{text.action}</button>
    </section>;
  }
}
