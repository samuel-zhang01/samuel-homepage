"use client";

import { localeOptions, type Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { DEFAULT_DESKTOP_PREFERENCES, type DesktopPreferences } from "@/lib/desktopPreferences";
import { getApplicationIcon } from "@/lib/iconIdentity";
import { System7Icon } from "./System7Icon";
import styles from "./DesktopSettings.module.css";
import { settingsCopy } from "./desktopSettingsCopy";



export default function DesktopSettings({ locale, preferences, onChange, onLocaleChange, onOpenBackup, storageAvailable }: {
  locale: Locale;
  preferences: DesktopPreferences;
  onChange: (change: Partial<DesktopPreferences>) => void;
  onLocaleChange: (locale: Locale) => void;
  onOpenBackup: () => void;
  storageAvailable: boolean | null;
}) {
  const t = (text: string) => projectText(locale, settingsCopy, text);
  return <div className={`system7-project ${styles.settings}`}>
    <header className={styles.header}><span className={styles.icon}><System7Icon kind={getApplicationIcon("settings")} /></span><div><h1>{t("Make this desktop yours.")}</h1><p>{t("Appearance, language and comfort controls for this browser.")}</p></div></header>
    <fieldset><legend>{t("Desktop pattern")}</legend><div className={styles.patterns}>
      {(["classic", "blue", "paper"] as const).map(pattern => <label key={pattern} className={styles.pattern}>
        <span className={`${styles.sample} desktop-pattern--${pattern}`} aria-hidden="true"><span /></span>
        <span><input type="radio" name="desktop-pattern" value={pattern} checked={preferences.pattern === pattern} onChange={() => onChange({ pattern })} />{t({ classic: "Classic", blue: "Blue", paper: "Paper" }[pattern])}</span>
      </label>)}
    </div></fieldset>
    <fieldset><legend>{t("Language")}</legend><div className={styles.languages}>
      {localeOptions.map(option => <label key={option.locale} lang={option.locale}><input type="radio" name="desktop-language" value={option.locale} checked={locale === option.locale} onChange={() => onLocaleChange(option.locale)} />{option.label}</label>)}
    </div></fieldset>
    <fieldset><legend>{t("Clock format")}</legend><div className={styles.languages}>
      {(["24h", "12h"] as const).map(format => <label key={format}><input type="radio" name="clock-format" value={format} checked={preferences.clockFormat === format} onChange={() => onChange({ clockFormat: format })} />{t(format === "24h" ? "24-hour" : "12-hour")}</label>)}
    </div></fieldset>
    <fieldset><legend>{t("Comfort")}</legend>
      <label className={styles.option}><input type="checkbox" checked={preferences.reduceEffects} onChange={event => onChange({ reduceEffects: event.target.checked })} aria-describedby="settings-effects-help" />{t("Reduce interface effects")}</label>
      <p id="settings-effects-help">{t("Reduces transitions and loading effects. Interactive demos keep their own playback controls. Your device’s reduced-motion preference always applies.")}</p>
      <label className={styles.option}><input type="checkbox" checked={preferences.showStartup} onChange={event => onChange({ showStartup: event.target.checked })} aria-describedby="settings-startup-help" />{t("Show the startup sequence")}</label>
      <p id="settings-startup-help">{t("Plays once per browser session when you enter through Start Here. Direct links open immediately.")}</p>
    </fieldset>
    <section className={styles.data}><h2>{t("Your data")}</h2><p>{t("Preferences and desk notes stay in this browser profile. They do not sync to another device. Export a desk backup before clearing site data.")}</p><button type="button" className="s7-button" onClick={onOpenBackup}>{t("Open desk backup tools")}</button></section>
    <footer><button type="button" className="s7-button" onClick={() => onChange(DEFAULT_DESKTOP_PREFERENCES)} aria-describedby="settings-reset-help">{t("Reset display settings")}</button><p id="settings-reset-help">{t("Resets the pattern, clock, effects and startup sequence. Your language, notes and other desk data stay as they are.")}</p><p role="status">{t(storageAvailable === false ? "Browser storage is unavailable. These settings apply for this visit only." : storageAvailable ? "Display settings saved in this browser." : "Changes apply immediately.")}</p></footer>
  </div>;
}
