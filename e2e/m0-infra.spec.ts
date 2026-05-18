import { expect, test } from "@playwright/test"
import { localeButton, themeButton, waitForHydration } from "./_helpers"

test.describe("M0 — theme", () => {
  test("toggles .dark on html element", async ({ page }) => {
    await page.goto("pt/")
    await waitForHydration(page)
    const html = page.locator("html")
    const before = await html.evaluate((el) => el.classList.contains("dark"))
    await themeButton(page).click()
    const after = await html.evaluate((el) => el.classList.contains("dark"))
    expect(after).toBe(!before)
  })

  test("persists theme across reload", async ({ page }) => {
    await page.goto("pt/")
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
    await page.goto("pt/")
    expect(await page.locator("html").evaluate((el) => el.classList.contains("dark"))).toBe(true)
  })
})

test.describe("M0 — i18n", () => {
  test("LocaleToggle navigates PT -> EN preserving path", async ({ page }) => {
    await page.goto("pt/projects")
    await waitForHydration(page)
    await localeButton(page).click()
    await expect(page).toHaveURL(/\/en\/projects/)
  })

  test("LocaleToggle navigates EN -> PT preserving path", async ({ page }) => {
    await page.goto("en/projects")
    await waitForHydration(page)
    await localeButton(page).click()
    await expect(page).toHaveURL(/\/pt\/projects/)
  })

  test("root / redirects to /pt/ via Navigate", async ({ page }) => {
    await page.goto("")
    await expect(page).toHaveURL(/\/portfolio\/pt\/?$/)
  })

  test("<html lang> updates to en-US on /en/ after hydration", async ({ page }) => {
    await page.goto("en/")
    await waitForHydration(page)
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  })
})
