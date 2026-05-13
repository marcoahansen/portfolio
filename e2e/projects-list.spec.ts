import { test, expect } from "@playwright/test"

test("projects list shows technology filter", async ({ page }) => {
  await page.goto("/projects")
  await expect(page.getByLabel(/tecnologia/i)).toBeVisible()
})
