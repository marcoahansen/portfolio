import { Navigate } from "react-router"
import { DEFAULT_LOCALE } from "@/i18n"

export function meta() {
  return [
    {
      tagName: "link",
      rel: "canonical",
      href: `/portfolio/${DEFAULT_LOCALE}/`,
    },
    {
      httpEquiv: "refresh",
      content: `0; url=/portfolio/${DEFAULT_LOCALE}/`,
    },
  ]
}

export default function RootRedirect() {
  return <Navigate to={`/${DEFAULT_LOCALE}/`} replace />
}
