// ── Configuration i18n (FR / EN) ─────────────────────────────────────────────
// vue-i18n en mode Composition API. La langue choisie est persistée dans
// localStorage et exposée via `currentLocale()` pour les appels API
// (en-tête Accept-Language).
import { createI18n } from "vue-i18n";
import fr from "./locales/fr.json";
import en from "./locales/en.json";

export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "fr";
const STORAGE_KEY = "locale";

function resolveInitialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) {
    return saved as AppLocale;
  }
  // Repli sur la langue du navigateur si elle est supportée.
  const nav = navigator.language?.slice(0, 2);
  if (nav && (SUPPORTED_LOCALES as readonly string[]).includes(nav)) {
    return nav as AppLocale;
  }
  return DEFAULT_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { fr, en },
});

/** Langue active (utilisable hors composant, ex. client API). */
export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale;
}

/** Change la langue, la persiste et met à jour l'attribut <html lang>. */
export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute("lang", locale);
}

// Applique la langue initiale au <html lang> au démarrage.
document.documentElement.setAttribute("lang", currentLocale());
