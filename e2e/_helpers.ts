import type { Page } from "@playwright/test"

export const themeButton = (page: Page) => page.getByRole("button", { name: /tema|theme/i })

export const localeButton = (page: Page) =>
  page.getByRole("button", { name: /Mudar idioma|Switch language/i })

export async function waitForHydration(page: Page): Promise<void> {
  await page.locator("button[aria-label*='tema'] svg, button[aria-label*='theme'] svg").waitFor()
}
