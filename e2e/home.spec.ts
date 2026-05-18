import { test, expect } from "@playwright/test"

test("home hero renders name, role and CV CTA", async ({ page }) => {
  await page.goto("pt/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Marco")

  const cv = page.getByRole("link", { name: /Baixar CV/i })
  await expect(cv).toHaveAttribute("href", /\/cv\/.+\.pdf$/)
  await expect(cv).toHaveAttribute("download", /.*/)

  const gh = page.getByRole("link", { name: /GitHub:/ })
  await expect(gh).toHaveAttribute("target", "_blank")
  await expect(gh).toHaveAttribute("rel", /noopener/)
})

test("home renders skills section with category groups", async ({ page }) => {
  await page.goto("pt/")

  await expect(page.getByRole("heading", { level: 2, name: /habilidades/i })).toBeVisible()
  await expect(page.getByRole("group", { name: /frontend/i })).toBeVisible()
  await expect(page.getByRole("group", { name: /pedagóg/i })).toBeVisible()
})

test("home renders experience timeline with ongoing entry on top", async ({ page }) => {
  await page.goto("pt/")

  await expect(page.getByRole("heading", { level: 2, name: /experiência/i })).toBeVisible()

  const articles = page.locator("section#experience article")
  await expect(articles.first()).toContainText(/Presente/)
})

test("home renders education section separate from experience", async ({ page }) => {
  await page.goto("pt/")

  await expect(page.getByRole("heading", { level: 2, name: /forma|educa/i })).toBeVisible()
  await expect(page.locator("section#education article").first()).toBeVisible()
})
