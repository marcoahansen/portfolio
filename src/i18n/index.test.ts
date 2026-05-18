import { describe, it, expect } from "vitest"
import i18n, { isLocale, LOCALES, DEFAULT_LOCALE } from "./index"

describe("isLocale", () => {
  it("accepts pt", () => {
    expect(isLocale("pt")).toBe(true)
  })

  it("accepts en", () => {
    expect(isLocale("en")).toBe(true)
  })

  it("rejects unknown locale", () => {
    expect(isLocale("fr")).toBe(false)
  })

  it("rejects undefined", () => {
    expect(isLocale(undefined)).toBe(false)
  })
})

describe("i18n init", () => {
  it("exposes LOCALES and DEFAULT_LOCALE", () => {
    expect(LOCALES).toEqual(["pt", "en"])
    expect(DEFAULT_LOCALE).toBe("pt")
  })

  it("initializes with pt as default language", () => {
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.language).toBe("pt")
  })

  it("resolves nested keys for pt", () => {
    expect(i18n.t("hero.viewProjects", { lng: "pt" })).toBe("Ver projetos")
    expect(i18n.t("theme.toDark", { lng: "pt" })).toBe("Mudar para tema escuro")
  })

  it("resolves nested keys for en", () => {
    expect(i18n.t("hero.viewProjects", { lng: "en" })).toBe("View projects")
    expect(i18n.t("theme.toDark", { lng: "en" })).toBe("Switch to dark theme")
  })

  it("interpolates locale.switchTo", () => {
    expect(i18n.t("locale.switchTo", { lng: "pt", locale: "EN" })).toBe("Mudar idioma para EN")
    expect(i18n.t("locale.switchTo", { lng: "en", locale: "PT" })).toBe("Switch language to PT")
  })
})
