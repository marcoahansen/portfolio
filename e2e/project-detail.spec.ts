import { test, expect } from "@playwright/test"

test("project detail renders project title", async ({ page }) => {
  await page.goto("pt/projects/p1")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Projeto")
})
