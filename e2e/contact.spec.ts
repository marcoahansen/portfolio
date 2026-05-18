import { test, expect } from "@playwright/test"
import { waitForHydration } from "./_helpers"

test("contact section has form fields and alt channels", async ({ page }) => {
  await page.goto("pt/#contact")

  await expect(page.getByRole("heading", { level: 2, name: /contato/i })).toBeVisible()
  await expect(page.getByLabel(/nome/i)).toBeVisible()
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/assunto/i)).toBeVisible()
  await expect(page.getByLabel(/mensagem/i)).toBeVisible()
  await expect(page.getByRole("button", { name: /enviar/i })).toBeVisible()
  await expect(page.getByRole("link", { name: /linkedin/i }).first()).toBeVisible()
})

test("Hero 'Falar comigo' CTA scrolls to #contact without leaving home", async ({ page }) => {
  await page.goto("pt/")
  await waitForHydration(page)
  await expect(page.locator("section#contact")).toBeAttached()

  const cta = page.getByRole("link", { name: /Falar comigo/i })
  await expect(cta).toHaveAttribute("href", "#contact")

  await cta.click()

  await expect(page).toHaveURL(/\/portfolio\/pt\/?#contact$/)
  await expect
    .poll(
      async () =>
        page.locator("section#contact").evaluate((el) => {
          const r = el.getBoundingClientRect()
          return r.top < window.innerHeight && r.bottom > 0
        }),
      { timeout: 5000 },
    )
    .toBe(true)
})
