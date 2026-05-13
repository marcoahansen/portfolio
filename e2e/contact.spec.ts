import { test, expect } from "@playwright/test"

test("contact section has email input", async ({ page }) => {
  await page.goto("/#contact")
  await expect(page.getByLabel(/email/i)).toBeVisible()
})
