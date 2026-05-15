import { test, expect } from "@playwright/test"

test("contact section has form fields and alt channels", async ({ page }) => {
  await page.goto("#contact")

  await expect(page.getByRole("heading", { level: 2, name: /contato/i })).toBeVisible()
  await expect(page.getByLabel(/nome/i)).toBeVisible()
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/assunto/i)).toBeVisible()
  await expect(page.getByLabel(/mensagem/i)).toBeVisible()
  await expect(page.getByRole("button", { name: /enviar/i })).toBeVisible()
  await expect(page.getByRole("link", { name: /linkedin/i }).first()).toBeVisible()
})
