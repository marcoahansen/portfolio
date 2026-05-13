import { test, expect } from "@playwright/test"

test("home hero renders name, role and CV CTA", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")

  const cv = page.getByRole("link", { name: /Download CV/ })
  await expect(cv).toHaveAttribute("href", /^\/cv\/.+\.pdf$/)
  await expect(cv).toHaveAttribute("download", /.*/)

  const gh = page.getByRole("link", { name: /GitHub:/ })
  await expect(gh).toHaveAttribute("target", "_blank")
  await expect(gh).toHaveAttribute("rel", /noopener/)
})
