import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/lib/theme"
import { Navbar } from "@/components/Navbar"
import { SkipLink } from "@/components/SkipLink"
import "@/i18n"
import "./app.css"

const themeBootstrap = `(function(){try{var t=localStorage.getItem("mh-theme");var d=t==="dark"||(t===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(_){}})();`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return (
    <ThemeProvider>
      <SkipLink />
      <Navbar />
      <Outlet />
    </ThemeProvider>
  )
}
