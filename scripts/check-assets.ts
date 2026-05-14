import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { validateHero } from "../src/lib/validation"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function fail(message: string): never {
  console.error(`check-assets ERROR: ${message}`)
  process.exit(1)
}

const heroRaw = readFileSync(resolve(ROOT, "src/data/hero.json"), "utf8")
const hero = validateHero(JSON.parse(heroRaw))

const cvPath = resolve(ROOT, "public/cv", hero.cv.fileName)
if (!existsSync(cvPath)) {
  fail(`CV file missing: ${cvPath}\n` + "Update src/data/hero.json or place the PDF at public/cv/")
}

const avatarPath = resolve(ROOT, "public" + hero.avatar.src)
if (!existsSync(avatarPath)) {
  fail(`Avatar missing: ${avatarPath}`)
}

console.log("check-assets OK: hero.json validated and all referenced assets exist")
