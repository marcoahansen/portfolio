import { test, expect } from "@playwright/test"

test("home loads with hero title containing 'Marco'", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")
})
