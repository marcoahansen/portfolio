import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

const themeButton = (page: Page) => page.getByRole("button", { name: /tema/i })

const waitForHydration = async (page: Page) => {
  await page.locator("button[aria-label*='tema'] svg").waitFor()
}

test.describe("M0 — theme", () => {
  test("toggles .dark on html element", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    const html = page.locator("html")
    const before = await html.evaluate((el) => el.classList.contains("dark"))
    await themeButton(page).click()
    const after = await html.evaluate((el) => el.classList.contains("dark"))
    expect(after).toBe(!before)
  })

  test("persists theme across reload", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    const initialDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"))
    await themeButton(page).click()
    const afterClick = await page.locator("html").evaluate((el) => el.classList.contains("dark"))
    expect(afterClick).toBe(!initialDark)
    await page.reload()
    await waitForHydration(page)
    const afterReload = await page.locator("html").evaluate((el) => el.classList.contains("dark"))
    expect(afterReload).toBe(afterClick)
  })

  test("no FOUC: html starts with .dark when localStorage has dark", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("mh-theme", "dark")
    })
    await page.goto("/")
    expect(await page.locator("html").evaluate((el) => el.classList.contains("dark"))).toBe(true)
  })
})
