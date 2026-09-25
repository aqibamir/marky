"use client";

// App-wide "mode" (language + license class) rather than a per-session
// filter: persisted across visits and shared by every page via the header
// switcher, so picking "Class B" or "English" once sticks everywhere.

import type { LicenseClass } from "./drivingQuestions";

export interface AppSettings {
  lang: "de" | "en";
  licenseClass: LicenseClass;
}

const KEY = "marky:app-settings";
const DEFAULT_SETTINGS: AppSettings = { lang: "de", licenseClass: "all" };

export const APP_SETTINGS_EVENT = "marky:app-settings-changed";

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_EVENT, { detail: settings }));
}
