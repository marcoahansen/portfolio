import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const DATASETS = ["hero", "skills", "experiences", "education", "projects"] as const

function fail(msg: string): never {
  console.error(`check-i18n ERROR: ${msg}`)
  process.exit(1)
}

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix]
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${prefix}[]`]
    const out: string[] = []
    for (let i = 0; i < value.length; i++) {
      out.push(...flattenKeys(value[i], `${prefix}[${i}]`))
    }
    return out
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    flattenKeys(v, prefix ? `${prefix}.${k}` : k),
  )
}

function load(path: string): unknown {
  if (!existsSync(path)) fail(`missing file: ${path}`)
  return JSON.parse(readFileSync(path, "utf8"))
}

const ptDict: unknown = load(resolve(ROOT, "src/i18n/locales/pt/translation.json"))
const enDict: unknown = load(resolve(ROOT, "src/i18n/locales/en/translation.json"))
const ptKeys = new Set<string>(flattenKeys(ptDict))
const enKeys = new Set<string>(flattenKeys(enDict))
const missingInEn = Array.from(ptKeys).filter((k) => !enKeys.has(k))
const missingInPt = Array.from(enKeys).filter((k) => !ptKeys.has(k))
if (missingInEn.length || missingInPt.length) {
  fail(
    `UI dictionary key mismatch.\n` +
      (missingInEn.length ? `  missing in EN: ${missingInEn.join(", ")}\n` : "") +
      (missingInPt.length ? `  missing in PT: ${missingInPt.join(", ")}` : ""),
  )
}

for (const ds of DATASETS) {
  const ptPath = resolve(ROOT, `src/data/${ds}.pt.json`)
  const enPath = resolve(ROOT, `src/data/${ds}.en.json`)
  if (!existsSync(ptPath) && !existsSync(enPath)) continue
  const pt = load(ptPath)
  const en = load(enPath)
  const ptShape = JSON.stringify(flattenKeys(pt).sort())
  const enShape = JSON.stringify(flattenKeys(en).sort())
  if (ptShape !== enShape) {
    fail(`Dataset shape mismatch in '${ds}': pt and en JSON keys diverge.`)
  }
}

console.log("check-i18n OK: dictionaries and datasets are in parity")
