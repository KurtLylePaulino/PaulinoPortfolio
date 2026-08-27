# Paulino Portfolio

The monorepo behind Kurt Lyle Paulino's portfolio. It holds two static sites
and two shared packages.

## Layout

```
packages/
  content/    Zod-validated data: projects, artwork, tracks, writing
  ui/         Design tokens and shared Astro components
sites/
  main/       The public portfolio site
  technical/  A text-first technical variant
```

`packages/content` is the single source of truth for all site data. Both
`sites/main` and `sites/technical` import it at build time.

## Running it

Requires Node 22.12 or newer.

```
npm install
npm run dev -w sites/main
npm run build
npm test
npm run typecheck
```
