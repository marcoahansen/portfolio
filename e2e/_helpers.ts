import type { Page } from "@playwright/test"

export const themeButton = (page: Page) => page.getByRole("button", { name: /tema|theme/i })

export const localeButton = (page: Page) =>
  page.getByRole("button", { name: /Mudar idioma|Switch language/i })

export const navHeader = (page: Page) => page.locator("header[data-scrolled]")

export const skipLink = (page: Page) => page.getByRole("link", { name: /pular|skip/i })

export const mobileMenuTrigger = (page: Page) =>
  page.getByRole("button", { name: /Abrir menu|Open menu/i })

export async function waitForHydration(page: Page): Promise<void> {
  await page.locator("button[aria-label*='tema'] svg, button[aria-label*='theme'] svg").waitFor()
}
