import type { Config } from "@react-router/dev/config"

export default {
  appDirectory: "src",
  ssr: false,
  prerender: ["/", "/pt", "/pt/projects", "/en", "/en/projects"],
  basename: "/portfolio/",
} satisfies Config
