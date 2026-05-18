import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import pt from "./locales/pt/translation.json"
import en from "./locales/en/translation.json"
import type { Locale } from "@/types/i18n"

export const LOCALES = ["pt", "en"] as const
export type { Locale }
export const DEFAULT_LOCALE: Locale = "pt"

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { pt: { translation: pt }, en: { translation: en } },
    lng: DEFAULT_LOCALE,
    fallbackLng: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  })
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "pt" || value === "en"
}

export default i18n
