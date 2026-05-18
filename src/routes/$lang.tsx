import { Navigate, Outlet, useParams } from "react-router"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { isLocale } from "@/i18n"

const HTML_LANG: Record<"pt" | "en", string> = {
  pt: "pt-BR",
  en: "en-US",
}

export default function LangLayout() {
  const { lang } = useParams()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (isLocale(lang)) {
      if (i18n.language !== lang) {
        void i18n.changeLanguage(lang)
      }
      document.documentElement.setAttribute("lang", HTML_LANG[lang])
    }
  }, [lang, i18n])

  if (!isLocale(lang)) {
    return <Navigate to="/pt/" replace />
  }
  return <Outlet />
}
