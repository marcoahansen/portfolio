# Portfolio — Marco Hansen

Personal portfolio. React 19 + TypeScript (strict) + React Router v7 + Tailwind v3 + shadcn/ui. Hosted on GitHub Pages.

Decisions live in `docs/spec.md`. Scaffolding recipe in `docs/scaffolding-specification.md`. Implementation rules in `AGENTS.md`.

## Quickstart

```sh
pnpm install
cp .env.example .env   # fill EmailJS keys
pnpm dev               # http://localhost:5173
```

## Scripts

| Command              | Purpose                            |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Local dev server                   |
| `pnpm build`         | Production build (`build/client/`) |
| `pnpm test`          | Vitest watch                       |
| `pnpm test:coverage` | Coverage + enforced thresholds     |
| `pnpm lint`          | ESLint, zero warnings              |
| `pnpm format`        | Prettier write                     |
| `pnpm typecheck`     | RR7 typegen + `tsc --noEmit`       |
| `pnpm e2e`           | Playwright smoke tests             |

## License

UNLICENSED — personal portfolio of Marco Hansen.
