# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the npm-workspaces monorepo with a validated shared content package, a tested design-token package, and two Astro site shells that build against them.

**Architecture:** One repo, two Astro sites, two shared packages. `packages/content` owns every piece of site data behind Zod schemas that run at build time, so malformed data fails the build instead of shipping a broken page. `packages/ui` owns the design tokens, with tests asserting WCAG contrast and asserting that the CSS custom properties never drift from the TypeScript palette. Both sites import from both packages. No site fetches data over the network.

**Tech Stack:** Node 22.12+, Astro 7.2.x, TypeScript 7.x, Zod 4.x, Vitest 4.x, npm workspaces.

## Global Constraints

- **Node >= 22.12.0.** Astro 7 declares `engines.node: ">=22.12.0"`. The machine currently runs 20.17.0. Task 1 upgrades it, and nothing else can proceed first.
- **Zero em dashes and en dashes in any site copy.** `—` and `–` are banned in every user-visible string. This is enforced by the schema in Task 2, not left to review.
- **No CSS framework.** Plain CSS with custom properties.
- **Dark theme only.** Single deliberate commitment. Every color painted explicitly.
- **Every palette pair used for text passes WCAG AA (>= 4.5:1).** Enforced by test in Task 6.
- **Nothing hardcodes the project count.** No `slice(0, 7)`, no fixed seven-cell grid, no copy saying "seven projects". Grids derive cell count from data length.
- **Repo:** `github.com/KurtLylePaulino/PaulinoPortfolio`. Main site base path `/PaulinoPortfolio`, technical site base path `/PaulinoPortfolio/technical`.
- **Branch:** all Phase 1 work happens on `phase/1-foundation`. Push after every task. Never force-push.
- **Commit after every task.** The remote repo is the backup.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Workspace root. Declares workspaces, shared scripts. No app code. |
| `tsconfig.base.json` | Compiler options every package extends. |
| `vitest.config.ts` | Test runner config for the whole workspace. |
| `packages/content/package.json` | Content package manifest. |
| `packages/content/src/primitives.ts` | Reusable field validators: `prose`, `httpUrl`, `slug`. One responsibility: string-level rules including the em-dash ban. |
| `packages/content/src/schema.ts` | Zod object schemas for Project, Artwork, Track, Writing. |
| `packages/content/src/projects.ts` | The 7 projects as typed data, parsed through the schema at module load. |
| `packages/content/src/collections.ts` | Loads and validates the bulk JSON manifests (art, music, writing). |
| `packages/content/src/index.ts` | Public surface. The only path sites import from. |
| `packages/content/data/art.json` | 175 artwork entries, migrated. Machine-generated bulk. |
| `packages/content/data/music.json` | 40 track entries, migrated. |
| `packages/content/data/writing.json` | 10 document entries, migrated. |
| `packages/content/test/*.test.ts` | Schema, data-integrity, and copy-rule tests. |
| `packages/ui/package.json` | UI package manifest. |
| `packages/ui/src/palette.ts` | The palette as data. Source of truth for color. |
| `packages/ui/src/contrast.ts` | WCAG relative-luminance and contrast-ratio math. |
| `packages/ui/src/tokens.css` | CSS custom properties consumed by both sites. |
| `packages/ui/test/*.test.ts` | Contrast thresholds and CSS/TS drift tests. |
| `sites/main/astro.config.mjs` | Main site config. `base: '/PaulinoPortfolio'`. |
| `sites/technical/astro.config.mjs` | Technical site config. `base: '/PaulinoPortfolio/technical'`. |

Splitting `primitives.ts` from `schema.ts` is deliberate: the em-dash ban and URL rules are policy that several schemas share, and keeping them in one small file means changing the policy touches one place.

---

### Task 1: Node upgrade and workspace skeleton

**Files:**
- Create: `package.json`, `tsconfig.base.json`, `vitest.config.ts`
- Create: `packages/content/package.json`, `packages/ui/package.json`
- Create: `packages/ui/test/smoke.test.ts`

**Interfaces:**
- Consumes: nothing. This is the first task.
- Produces: a workspace where `npm test` runs Vitest across all packages, and `npm -w <pkg>` targets a single package.

- [ ] **Step 1: Check the current Node version**

Run: `node -v`
Expected: `v20.17.0` (or anything below v22.12.0), which confirms the upgrade is needed.

- [ ] **Step 2: Upgrade Node**

```bash
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

If winget reports Node is already installed at an older version, use `winget upgrade OpenJS.NodeJS.LTS` instead.

- [ ] **Step 3: Verify the upgrade in a NEW shell**

The PATH change does not apply to an already-open shell. Open a new terminal, then run:

Run: `node -v && npm -v`
Expected: node prints `v22.12.0` or higher. If it still prints v20, the shell is stale. Open another one.

**Do not continue until this prints v22.12.0 or higher.** Every later step fails on Node 20.

- [ ] **Step 4: Create the workspace root `package.json`**

```json
{
  "name": "paulino-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "workspaces": [
    "packages/*",
    "sites/*"
  ],
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -b --pretty",
    "build": "npm run build -w sites/main && npm run build -w sites/technical"
  },
  "devDependencies": {
    "typescript": "^7.0.2",
    "vitest": "^4.1.11"
  }
}
```

- [ ] **Step 5: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/test/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 7: Create the two package manifests**

`packages/content/package.json`:

```json
{
  "name": "@portfolio/content",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "zod": "^4.4.3" }
}
```

`packages/ui/package.json`:

```json
{
  "name": "@portfolio/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./tokens.css": "./src/tokens.css"
  }
}
```

- [ ] **Step 8: Write the smoke test**

`packages/ui/test/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("workspace", () => {
  it("runs vitest on Node 22 or newer", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(22);
  });
});
```

- [ ] **Step 9: Install and run**

Run: `npm install && npm test`
Expected: install completes, then `1 passed`. If the Node assertion fails, return to Step 3.

- [ ] **Step 10: Commit and push**

```bash
git checkout -b phase/1-foundation
git add package.json tsconfig.base.json vitest.config.ts package-lock.json packages/
git commit -m "chore: scaffold npm workspaces monorepo with vitest"
git push -u origin phase/1-foundation
```

---

### Task 2: Copy primitives and the em-dash ban

**Files:**
- Create: `packages/content/src/primitives.ts`
- Test: `packages/content/test/primitives.test.ts`

**Interfaces:**
- Consumes: `zod` from Task 1's dependency.
- Produces:
  - `prose: z.ZodType<string>`: non-empty string, rejects `—` and `–`
  - `httpUrl: z.ZodType<string>`: non-empty string matching `/^https?:\/\//`
  - `slug: z.ZodType<string>`: lowercase, digits, hyphens only
  - `EM_DASH_MESSAGE: string`: the exact rejection message
  Tasks 3 through 5 build every schema field from these three validators.

- [ ] **Step 1: Write the failing test**

`packages/content/test/primitives.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { EM_DASH_MESSAGE, httpUrl, prose, slug } from "../src/primitives.js";

describe("prose", () => {
  it("accepts ordinary copy", () => {
    expect(prose.parse("A melanoma classifier at 90% accuracy.")).toBe(
      "A melanoma classifier at 90% accuracy.",
    );
  });

  it("rejects an em dash", () => {
    const result = prose.safeParse("Lead author \u2014 owned the balancing.");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EM_DASH_MESSAGE);
    }
  });

  it("rejects an en dash", () => {
    expect(prose.safeParse("2024\u20132026").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(prose.safeParse("").success).toBe(false);
  });

  it("allows a plain hyphen", () => {
    expect(prose.parse("2024-2026")).toBe("2024-2026");
  });
});

describe("httpUrl", () => {
  it("accepts an absolute https URL", () => {
    expect(httpUrl.parse("https://example.com/a")).toBe("https://example.com/a");
  });

  it("rejects a relative path", () => {
    expect(httpUrl.safeParse("/assets/img/a.webp").success).toBe(false);
  });
});

describe("slug", () => {
  it("accepts a kebab-case id", () => {
    expect(slug.parse("circuit-breakers")).toBe("circuit-breakers");
  });

  it("rejects uppercase and spaces", () => {
    expect(slug.safeParse("Circuit Breakers").success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- primitives`
Expected: FAIL, `Cannot find module '../src/primitives.js'`.

- [ ] **Step 3: Write the implementation**

`packages/content/src/primitives.ts`:

```ts
import { z } from "zod";

/**
 * Em dash and en dash are banned in every user-visible string.
 * Both the stop-slop rules and the taste skill forbid them, so the ban is
 * enforced here rather than left to review.
 */
export const EM_DASH_MESSAGE =
  "Em dash and en dash are banned in site copy. Use a hyphen, comma, or period.";

const DASH_PATTERN = /[\u2013\u2014]/;

export const prose = z
  .string()
  .min(1, "Copy cannot be empty")
  .refine((value) => !DASH_PATTERN.test(value), { message: EM_DASH_MESSAGE });

export const httpUrl = z
  .string()
  .min(1, "URL cannot be empty")
  .refine((value) => /^https?:\/\//.test(value), {
    message: "Must be an absolute http or https URL",
  });

export const slug = z
  .string()
  .min(1, "Slug cannot be empty")
  .refine((value) => /^[a-z0-9-]+$/.test(value), {
    message: "Slug must contain only lowercase letters, digits, and hyphens",
  });
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- primitives`
Expected: `9 passed`.

- [ ] **Step 5: Commit and push**

```bash
git add packages/content/src/primitives.ts packages/content/test/primitives.test.ts
git commit -m "feat(content): add copy primitives with enforced em-dash ban"
git push
```

---

### Task 3: Content schemas

**Files:**
- Create: `packages/content/src/schema.ts`
- Test: `packages/content/test/schema.test.ts`

**Interfaces:**
- Consumes: `prose`, `httpUrl`, `slug` from Task 2.
- Produces:
  - `projectSchema`, `artworkSchema`, `trackSchema`, `writingSchema` (Zod object schemas)
  - `type Project`, `type Artwork`, `type Track`, `type Writing` (inferred types)
  - `DOMAINS: readonly ["ml", "game", "web", "tool"]`
  Task 4 parses project data with `projectSchema`. Task 5 parses the JSON manifests with the other three. Sites import the types.

- [ ] **Step 1: Write the failing test**

`packages/content/test/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { projectSchema, trackSchema } from "../src/schema.js";

const validProject = {
  id: "circuit-breakers",
  title: "Circuit Breakers",
  domain: "game",
  year: "2024-2026",
  featured: true,
  award: "Best Thesis, Best Paper, Best Presenter",
  tagline: "2D cybersecurity roguelike built in Unity",
  blurb: "A 2D roguelike that teaches cybersecurity through play.",
  summary: "Lead author on the thesis. Owned numerical balancing.",
  stack: ["Unity", "C#", "Firebase"],
  highlights: ["Lead author on the award-winning thesis"],
  metrics: [{ label: "Awards", value: "3x" }],
  links: [{ label: "Read the thesis", href: "https://example.com/t.pdf", kind: "primary" }],
};

describe("projectSchema", () => {
  it("accepts a complete project", () => {
    expect(projectSchema.parse(validProject).id).toBe("circuit-breakers");
  });

  it("accepts a project with every optional field absent", () => {
    const minimal = {
      ...validProject,
      award: undefined,
      media: undefined,
      demo: undefined,
      metrics: [],
      highlights: [],
    };
    expect(projectSchema.safeParse(minimal).success).toBe(true);
  });

  it("defaults link kind to secondary", () => {
    const parsed = projectSchema.parse({
      ...validProject,
      links: [{ label: "GitHub", href: "https://github.com/x/y" }],
    });
    expect(parsed.links[0]?.kind).toBe("secondary");
  });

  it("rejects an unknown domain", () => {
    expect(projectSchema.safeParse({ ...validProject, domain: "music" }).success).toBe(false);
  });

  it("rejects an em dash anywhere in copy", () => {
    const bad = { ...validProject, blurb: "A roguelike \u2014 built in Unity." };
    expect(projectSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a project with an empty stack", () => {
    expect(projectSchema.safeParse({ ...validProject, stack: [] }).success).toBe(false);
  });

  it("rejects a malformed year", () => {
    expect(projectSchema.safeParse({ ...validProject, year: "twenty-24" }).success).toBe(false);
  });
});

describe("trackSchema", () => {
  it("accepts a track with a relative src", () => {
    const parsed = trackSchema.parse({
      id: "gutter-pulse",
      title: "Gutter Pulse",
      collection: "original",
      src: "audio/original/gutter-pulse.mp3",
      duration: 214,
    });
    expect(parsed.duration).toBe(214);
  });

  it("rejects a negative duration", () => {
    const result = trackSchema.safeParse({
      id: "x", title: "X", collection: "original", src: "a.mp3", duration: -1,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- schema`
Expected: FAIL, `Cannot find module '../src/schema.js'`.

- [ ] **Step 3: Write the implementation**

`packages/content/src/schema.ts`:

```ts
import { z } from "zod";
import { httpUrl, prose, slug } from "./primitives.js";

export const DOMAINS = ["ml", "game", "web", "tool"] as const;

const linkSchema = z.object({
  label: prose,
  href: httpUrl,
  kind: z.enum(["primary", "secondary"]).default("secondary"),
});

const metricSchema = z.object({
  label: prose,
  value: prose,
});

export const projectSchema = z.object({
  id: slug,
  title: prose,
  domain: z.enum(DOMAINS),
  /** A single year ("2025") or an inclusive range ("2024-2026"). */
  year: z.string().refine((v) => /^\d{4}(-\d{4})?$/.test(v), {
    message: "Year must be YYYY or YYYY-YYYY",
  }),
  featured: z.boolean(),
  award: prose.optional(),
  tagline: prose,
  blurb: prose,
  summary: prose,
  stack: z.array(prose).min(1, "A project needs at least one stack entry"),
  highlights: z.array(prose),
  metrics: z.array(metricSchema),
  media: z.string().min(1).optional(),
  demo: httpUrl.optional(),
  links: z.array(linkSchema),
});

export const artworkSchema = z.object({
  id: slug,
  collection: z.enum(["artwork", "maps", "memes", "vivi", "yuria"]),
  src: z.string().min(1),
  thumb: z.string().min(1),
  alt: prose,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const trackSchema = z.object({
  id: slug,
  title: prose,
  collection: z.enum(["original", "dnd", "ruina"]),
  src: z.string().min(1),
  /** Length in whole seconds. */
  duration: z.number().int().positive(),
});

export const writingSchema = z.object({
  id: slug,
  title: prose,
  kind: z.enum(["lore", "story", "reference", "notes"]),
  blurb: prose,
  pdf: z.string().min(1),
  year: z.string().refine((v) => /^\d{4}$/.test(v), { message: "Year must be YYYY" }),
});

export type Project = z.infer<typeof projectSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Track = z.infer<typeof trackSchema>;
export type Writing = z.infer<typeof writingSchema>;
export type Domain = (typeof DOMAINS)[number];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- schema`
Expected: `9 passed`.

- [ ] **Step 5: Commit and push**

```bash
git add packages/content/src/schema.ts packages/content/test/schema.test.ts
git commit -m "feat(content): add Zod schemas for project, artwork, track, and writing"
git push
```

---

### Task 4: Migrate the seven projects

**Files:**
- Create: `packages/content/src/projects.ts`
- Create: `packages/content/src/index.ts`
- Test: `packages/content/test/projects.test.ts`
- Read for reference: `E:\CLAUDE WORKSTATION\PortFolio\FullPortfolio\assets\data\projects.json`

**Interfaces:**
- Consumes: `projectSchema`, `Project`, `DOMAINS` from Task 3.
- Produces:
  - `projects: Project[]`: all 7, validated at module load
  - `featuredProjects: Project[]`: the subset where `featured === true`
  - `projectById(id: string): Project | undefined`
  - `domainsInUse(): Domain[]`: derived from data, never hardcoded
  Sites in Phase 2 and 3 import these four from `@portfolio/content`.

**Important:** the source `projects.json` uses `category` where the new schema uses `domain`, and its copy contains middle dots and em dashes. Rewrite the copy while migrating. `fightmap-generator` maps to domain `tool`; `circuit-breakers` to `game`; `melanoma-cnn` to `ml`; the rest to `web`.

- [ ] **Step 1: Write the failing test**

`packages/content/test/projects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { domainsInUse, featuredProjects, projectById, projects } from "../src/projects.js";

describe("projects", () => {
  it("loads all seven projects", () => {
    expect(projects).toHaveLength(7);
  });

  it("gives every project a unique id", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the three known featured projects", () => {
    expect(featuredProjects.map((p) => p.id).sort()).toEqual(
      ["canrael-codex", "circuit-breakers", "fightmap-generator"],
    );
  });

  it("covers machine learning, games, and web", () => {
    const domains = domainsInUse();
    expect(domains).toContain("ml");
    expect(domains).toContain("game");
    expect(domains).toContain("web");
  });

  it("derives domains from the data rather than a hardcoded list", () => {
    const fromData = new Set(projects.map((p) => p.domain));
    expect(new Set(domainsInUse())).toEqual(fromData);
  });

  it("finds a project by id and returns undefined for a miss", () => {
    expect(projectById("circuit-breakers")?.title).toBe("Circuit Breakers");
    expect(projectById("nope")).toBeUndefined();
  });

  it("points every link at an absolute URL", () => {
    for (const project of projects) {
      for (const link of project.links) {
        expect(link.href).toMatch(/^https?:\/\//);
      }
    }
  });

  it("links the five projects that have their own repo", () => {
    const expected: Record<string, string> = {
      "fightmap-generator": "MapGenConcept",
      "canrael-codex": "canrael-codex",
      "haiku-daily": "HaikuDaily",
      "jianghu-proverbs": "jianghu-proverbs",
      "library-system": "Finals-Project-Webdev-LIBRARYMANAGEMENT",
    };
    for (const [id, repo] of Object.entries(expected)) {
      const hrefs = projectById(id)?.links.map((l) => l.href).join(" ") ?? "";
      expect(hrefs).toContain(repo);
    }
  });

  it("keeps every visible string free of em dashes", () => {
    const dash = /[\u2013\u2014]/;
    for (const project of projects) {
      for (const value of [project.title, project.tagline, project.blurb, project.summary]) {
        expect(dash.test(value)).toBe(false);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- projects`
Expected: FAIL, `Cannot find module '../src/projects.js'`.

- [ ] **Step 3: Read the source data**

Run: `node -e "const d=require('E:/CLAUDE WORKSTATION/PortFolio/FullPortfolio/assets/data/projects.json');console.log(JSON.stringify(d,null,2))"`

Use it as the factual source for stack, metrics, highlights, and award text. Rewrite all prose: replace middle dots and dashes, cut filler, keep every claim checkable.

- [ ] **Step 4: Write the implementation**

`packages/content/src/projects.ts`. All seven entries in full. The copy below is already rewritten through stop-slop from the source JSON: em dashes removed, middle dots removed, self-promotional openers cut ("My most ambitious static site"), and the multiplication sign replaced with the word.

```ts
import { projectSchema, type Domain, type Project } from "./schema.js";

const GH = "https://github.com/KurtLylePaulino";
const DOCS = "https://kurtlylepaulino.github.io/FullPortfolio/assets/docs";
const DEMOS = "https://kurtlylepaulino.github.io/FullPortfolio/projects";

const raw = [
  {
    id: "circuit-breakers",
    title: "Circuit Breakers",
    domain: "game",
    year: "2024-2026",
    featured: true,
    award: "Best Thesis, Best Paper, Best Presenter",
    tagline: "A 2D cybersecurity roguelike built in Unity",
    blurb:
      "A 2D roguelike that teaches cybersecurity through play. I was lead author on the paper and ran the numerical balancing across gameplay and the database systems.",
    summary:
      "Circuit Breakers turns cybersecurity concepts into roguelike runs. I owned the thesis and technical documentation, executed the numerical balancing for gameplay and the Firebase-backed database systems, and built features spanning UI, mechanics, and progression. It won Best Thesis, Best Paper, and Best Presenter.",
    stack: ["Unity", "C#", "Firebase", "Firestore"],
    highlights: [
      "Lead author on the award-winning thesis and technical documentation",
      "Numerical balancing across gameplay and database systems",
      "Built features from UI through core mechanics",
      "Firebase auth, stats, and achievements integration",
    ],
    metrics: [
      { label: "Awards", value: "3" },
      { label: "Engine", value: "Unity" },
      { label: "Role", value: "Lead author" },
    ],
    media: "projects/circuit-breakers.webp",
    links: [
      { label: "Read the thesis", href: `${DOCS}/IMRAD_FinalManuscript_CircuitBreakers.pdf`, kind: "primary" },
      { label: "Download build", href: "https://drive.google.com/drive/folders/1MR4GVBB7N-VR-IjFD2au542m6tY4nwLT" },
    ],
  },
  {
    id: "fightmap-generator",
    title: "Fightmap Generator",
    domain: "tool",
    year: "2026",
    featured: true,
    tagline: "Procedural battle-map generator with a CLI and a desktop app",
    blurb:
      "A dependency-light procedural generator for top-down tabletop battle maps. Six layout types across three themes, rendered to PNG with seeded, reproducible output.",
    summary:
      "Fightmap Generator builds top-down battle maps from plain algorithms rather than a model. A map is a 2D grid of tile types produced by room placement, corridor carving, and seeded value-noise scatter, then rendered in layers: noise-textured ground, raised objects with drop shadows, warm light glow, and a fog and vignette pass. Six layout archetypes (settlement, arena, dungeon, tomb, forest, wildlands) each render under any of three data-driven themes, giving 18 combinations, and a flood-fill check guarantees no walkable area is ever stranded. One numpy Generator threads through both generation and rendering, so the same seed reproduces byte-identical output. It runs as a CLI or a tkinter desktop app that packages into a standalone Windows executable, backed by a pytest suite covering tile and theme integrity, connectivity, noise determinism, reproducibility, the full type by theme matrix, and the CLI.",
    stack: ["Python", "Pillow", "NumPy", "tkinter", "pytest"],
    highlights: [
      "Six layout types across three themes, 18 combinations, from pure algorithms with no model involved",
      "Seeded numpy RNG threaded through generation and rendering, so one seed reproduces a byte-identical map",
      "Layered renderer: noise-textured ground, raised objects with drop shadows, light glow, fog and vignette",
      "Flood-fill connectivity guarantee, so no walkable region is ever stranded",
      "CLI plus tkinter desktop GUI, packageable to a standalone Windows executable",
    ],
    metrics: [
      { label: "Map types", value: "6" },
      { label: "Combinations", value: "18" },
      { label: "Interface", value: "CLI and GUI" },
    ],
    media: "projects/fightmap-generator.webp",
    links: [{ label: "View on GitHub", href: `${GH}/MapGenConcept`, kind: "primary" }],
  },
  {
    id: "canrael-codex",
    title: "The Canrael Codex",
    domain: "web",
    year: "2026",
    featured: true,
    tagline: "Dark-fantasy quote generator and worldbuilding companion",
    blurb:
      "A quote generator and worldbuilding companion for Canrael. 525 hand-written quotes across 8 regions, each region carrying its own ambient score and a concept-art scene gallery.",
    summary:
      "The Canrael Codex is a dark-fantasy quote generator built as a creative-support tool. It draws from 525 hand-written whispers, anonymous voices from across the continents, and filters them by 8 regions, each of which shifts the ambient music to match. A realm scene viewer opens a keyboard-navigable lightbox of concept art, roughly nine scenes per realm and 81 in total. Aged-parchment and silver-blue styling, an ember particle field, region-themed Web Audio ambience, synth sound effects, and keyboard shortcuts. Fully static and responsive with no build step and no dependencies.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "525 hand-written quotes spanning the world's many voices",
      "Realm scene viewer with a keyboard-navigable gallery of 81 concept-art scenes",
      "8 region filters, each with its own ambient score that shifts on selection",
      "Region-themed Web Audio ambience and synth effects over an ember particle field",
      "Fully responsive with zero dependencies and no build step",
    ],
    metrics: [
      { label: "Quotes", value: "525" },
      { label: "Scenes", value: "81" },
      { label: "Regions", value: "8" },
    ],
    media: "projects/canrael-codex.webp",
    demo: `${DEMOS}/canrael-codex/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/canrael-codex/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/canrael-codex` },
    ],
  },
  {
    id: "melanoma-cnn",
    title: "Melanoma Skin Cancer Detection",
    domain: "ml",
    year: "2025",
    featured: false,
    tagline: "Convolutional neural network for dermoscopic image classification",
    blurb:
      "A CNN that classifies dermoscopic images as benign or malignant above 90% accuracy, with experiments comparing optimizers and activation functions.",
    summary:
      "A convolutional neural network built in TensorFlow and Keras that classifies dermoscopic images as benign or malignant above 90% accuracy. I ran several experimental iterations comparing optimizers and activation functions to identify the most stable convergence patterns, documented in the notebook. The shared folder bundles the trained model, saved checkpoints, the dataset, and the base notebooks.",
    stack: ["Python", "TensorFlow", "Keras", "NumPy", "Matplotlib"],
    highlights: [
      "Above 90% classification accuracy on benign against malignant",
      "Comparative experiments across optimizers and activation functions",
      "Convergence-stability analysis used to pick the strongest configuration",
      "Reproducible notebook with saved model checkpoints",
    ],
    metrics: [
      { label: "Accuracy", value: "90% and above" },
      { label: "Task", value: "Binary classification" },
      { label: "Framework", value: "TensorFlow and Keras" },
    ],
    links: [
      { label: "Models and dataset", href: "https://drive.google.com/drive/folders/13oZi_EPwOwdQE_8IwyITkMBv0eWrohD7", kind: "primary" },
      { label: "Download the notebook", href: `${DOCS}/melanoma_model.ipynb` },
    ],
  },
  {
    id: "haiku-daily",
    title: "Haiku Daily",
    domain: "web",
    year: "2025",
    featured: false,
    tagline: "One classical haiku per day over a living sumi-e scene",
    blurb:
      "A living sumi-e night scene that surfaces one public-domain haiku per day, brush-written line by line, with parallax Mt Fuji, fireflies, drifting petals, and a koto soundscape.",
    summary:
      "A zero-dependency static site that surfaces one public-domain haiku per day from the classical masters, chosen deterministically from the calendar date. It opens with a shoji-screen intro over a living sumi-e night scene: parallax Mt Fuji, a glowing moon, drifting cloud and mist, falling sakura petals, fireflies, and swaying paper lanterns, with each haiku brush-written line by line. Audio unlocks on first interaction with a looping koto track and a synthesized fallback, plus quiet synth interface effects that are ducked, rate-limited, and remembered. Keyboard controls throughout, and a reduced-motion fallback.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "Deterministic daily haiku chosen from the calendar date",
      "Living sumi-e scene with parallax Mt Fuji, fireflies, petals, and lanterns",
      "Looping koto track with a synthesized koto and shakuhachi fallback",
      "Shoji-screen intro with character-by-character brush calligraphy",
      "Keyboard controls and a reduced-motion fallback",
    ],
    metrics: [
      { label: "Dependencies", value: "0" },
      { label: "Build step", value: "None" },
      { label: "Audio", value: "Web Audio" },
    ],
    media: "projects/haiku-daily.webp",
    demo: `${DEMOS}/haiku-daily/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/haiku-daily/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/HaikuDaily` },
    ],
  },
  {
    id: "jianghu-proverbs",
    title: "Jianghu Proverbs",
    domain: "web",
    year: "2025",
    featured: false,
    tagline: "200 attributed Chinese proverbs on a living wuxia scroll",
    blurb:
      "A living wuxia silk-scroll that rolls a random Chinese proverb from 200 classics, with animated scenery, looping music, a synthesized Web Audio soundscape, and brush-on-screen calligraphy.",
    summary:
      "A single-page static site staged as a living wuxia scene: a hanging silk scroll on aged rice paper, swaying red lanterns, parallax mountains with a distant pagoda, a breathing moon, and falling plum-blossom petals. It rolls a random proverb from 200 classics across 79 sources, including Confucius, Laozi, Sun Tzu, and Li Bai, with original text, pinyin, English, and full attribution. Each draw slashes a glint across the paper, brush-writes the proverb character by character, and stamps an index seal. A click-to-enter gate unlocks a looping erhu-style track and a fully synthesized soundscape of temple bell, fortune-stick rattle, sword glint, brush ticks, and seal thunk, all generated live with no sound files.",
    stack: ["HTML", "CSS", "Vanilla JS", "Web Audio API", "GitHub Pages"],
    highlights: [
      "200 attributed proverbs across 79 sources",
      "Looping music plus a fully synthesized Web Audio soundscape with no sound files",
      "Animated scenery: parallax mountains, swaying lanterns, petals, breathing moon",
      "Cinematic opening sequence with character-by-character brush calligraphy",
      "Keyboard controls and a reduced-motion fallback",
    ],
    metrics: [
      { label: "Proverbs", value: "200" },
      { label: "Sources", value: "79" },
      { label: "Audio", value: "Web Audio" },
    ],
    media: "projects/jianghu-proverbs.webp",
    demo: `${DEMOS}/jianghu-proverbs/index.html`,
    links: [
      { label: "Open the demo", href: `${DEMOS}/jianghu-proverbs/index.html`, kind: "primary" },
      { label: "View on GitHub", href: `${GH}/jianghu-proverbs` },
    ],
  },
  {
    id: "library-system",
    title: "Library Management System",
    domain: "web",
    year: "2024",
    featured: false,
    tagline: "Multi-role library platform with activity logging",
    blurb:
      "A library platform tracking books, users, and activity across Admin, Librarian, and Borrower roles, with activity logging and transaction records.",
    summary:
      "A web platform that tracks books, users, and activity across three roles: Admin, Librarian, and Borrower. I built the CRUD systems, the user-activity logging, and the transaction records, and designed the interactions and feedback flows between all three user types.",
    stack: ["HTML", "CSS", "JavaScript"],
    highlights: [
      "Three role types: Admin, Librarian, and Borrower",
      "Full CRUD for books and users",
      "User-activity logging and transaction records",
      "Cross-role interaction and feedback flows",
    ],
    metrics: [
      { label: "Roles", value: "3" },
      { label: "Domain", value: "CRUD" },
    ],
    links: [
      { label: "View on GitHub", href: `${GH}/Finals-Project-Webdev-LIBRARYMANAGEMENT`, kind: "primary" },
    ],
  },
];

/** Parsed at module load, so bad data fails the build rather than a page. */
export const projects: Project[] = raw.map((entry) => projectSchema.parse(entry));

export const featuredProjects: Project[] = projects.filter((p) => p.featured);

export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** Derived from the data so a new domain needs no code change. */
export function domainsInUse(): Domain[] {
  return [...new Set(projects.map((p) => p.domain))];
}
```

`packages/content/src/index.ts`:

```ts
export * from "./schema.js";
export * from "./projects.js";
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- projects`
Expected: `9 passed`. A failure naming a specific project means that entry's copy or links need fixing. A Zod parse error at import time means a field violates the schema, most often an em dash carried over from the source JSON.

- [ ] **Step 6: Commit and push**

```bash
git add packages/content/src/projects.ts packages/content/src/index.ts packages/content/test/projects.test.ts
git commit -m "feat(content): migrate seven projects to validated typed data"
git push
```

---

### Task 5: Migrate the bulk manifests

**Files:**
- Create: `packages/content/data/art.json`, `packages/content/data/music.json`, `packages/content/data/writing.json`
- Create: `packages/content/src/collections.ts`
- Modify: `packages/content/src/index.ts`
- Test: `packages/content/test/collections.test.ts`
- Read for reference: `E:\CLAUDE WORKSTATION\PortFolio\FullPortfolio\assets\data\art.json` and `music.json`

**Interfaces:**
- Consumes: `artworkSchema`, `trackSchema`, `writingSchema` from Task 3.
- Produces:
  - `artworks: Artwork[]`, `tracks: Track[]`, `writings: Writing[]`
  - `artByCollection(name): Artwork[]`, `tracksByCollection(name): Track[]`

These stay JSON rather than TypeScript because they are bulk machine-generated manifests. Hand-writing 175 artwork entries as TS gains nothing. Project copy stays TS because it is hand-curated prose.

- [ ] **Step 1: Write the failing test**

`packages/content/test/collections.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { artByCollection, artworks, tracks, tracksByCollection, writings } from "../src/collections.js";

describe("artworks", () => {
  it("loads every image", () => {
    expect(artworks.length).toBeGreaterThan(100);
  });

  it("gives every artwork positive dimensions", () => {
    for (const art of artworks) {
      expect(art.width).toBeGreaterThan(0);
      expect(art.height).toBeGreaterThan(0);
    }
  });

  it("groups by collection", () => {
    expect(artByCollection("yuria").length).toBeGreaterThan(0);
    expect(artByCollection("yuria").every((a) => a.collection === "yuria")).toBe(true);
  });
});

describe("tracks", () => {
  it("loads every track", () => {
    expect(tracks.length).toBeGreaterThan(30);
  });

  it("covers all three playlists", () => {
    for (const name of ["original", "dnd", "ruina"] as const) {
      expect(tracksByCollection(name).length).toBeGreaterThan(0);
    }
  });

  it("gives every track a unique id", () => {
    const ids = tracks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("writings", () => {
  it("loads the Canrael documents", () => {
    expect(writings.length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- collections`
Expected: FAIL, `Cannot find module '../src/collections.js'`.

- [ ] **Step 3: Generate the three JSON manifests**

Write a one-off migration script at `packages/content/scripts/migrate.mjs` that reads the old `art.json` and `music.json`, reshapes them to the new schema field names, derives `alt` text and `duration`, and writes the three files. Run it once, commit the output, and keep the script for future re-runs.

Requirements the script must satisfy:
- Every `id` is kebab-case and unique.
- `alt` text is descriptive and contains no em dashes.
- `duration` is a positive integer in seconds.
- `writing.json` is hand-written from the 10 PDFs in `assets/docs/writing`, since no source manifest exists.

- [ ] **Step 4: Write the loader**

`packages/content/src/collections.ts`:

```ts
import artData from "../data/art.json" with { type: "json" };
import musicData from "../data/music.json" with { type: "json" };
import writingData from "../data/writing.json" with { type: "json" };
import {
  artworkSchema, trackSchema, writingSchema,
  type Artwork, type Track, type Writing,
} from "./schema.js";

export const artworks: Artwork[] = artData.map((a) => artworkSchema.parse(a));
export const tracks: Track[] = musicData.map((t) => trackSchema.parse(t));
export const writings: Writing[] = writingData.map((w) => writingSchema.parse(w));

export function artByCollection(name: Artwork["collection"]): Artwork[] {
  return artworks.filter((a) => a.collection === name);
}

export function tracksByCollection(name: Track["collection"]): Track[] {
  return tracks.filter((t) => t.collection === name);
}
```

Append to `packages/content/src/index.ts`:

```ts
export * from "./collections.js";
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- collections`
Expected: `7 passed`.

- [ ] **Step 6: Commit and push**

```bash
git add packages/content/data packages/content/scripts packages/content/src/collections.ts packages/content/src/index.ts packages/content/test/collections.test.ts
git commit -m "feat(content): migrate art, music, and writing manifests"
git push
```

---

### Task 6: Design tokens with enforced contrast

**Files:**
- Create: `packages/ui/src/palette.ts`, `packages/ui/src/contrast.ts`, `packages/ui/src/tokens.css`, `packages/ui/src/index.ts`
- Test: `packages/ui/test/contrast.test.ts`, `packages/ui/test/tokens.test.ts`
- Delete: `packages/ui/test/smoke.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `palette`: the Archive colors as data
  - `worldAccents`: the four world hues
  - `contrastRatio(a: string, b: string): number`
  - `packages/ui/tokens.css`: the custom properties both sites import

- [ ] **Step 1: Write the failing tests**

`packages/ui/test/contrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/contrast.js";
import { palette, worldAccents } from "../src/palette.js";

describe("contrastRatio", () => {
  it("returns 21 for black against white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("returns 1 for a color against itself", () => {
    expect(contrastRatio("#c4913c", "#c4913c")).toBeCloseTo(1, 5);
  });
});

describe("Archive palette", () => {
  const textTokens = ["ink", "inkMid", "inkLow", "accent"] as const;

  it.each(textTokens)("passes WCAG AA for %s on the ground", (token) => {
    expect(contrastRatio(palette[token], palette.ground)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(textTokens)("passes WCAG AA for %s on raised surfaces", (token) => {
    expect(contrastRatio(palette[token], palette.raised)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps every world accent readable on the ground", () => {
    for (const [world, hex] of Object.entries(worldAccents)) {
      expect(contrastRatio(hex, palette.ground), `${world} accent`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("gives the three ink tiers visibly different weights", () => {
    const ink = contrastRatio(palette.ink, palette.ground);
    const mid = contrastRatio(palette.inkMid, palette.ground);
    const low = contrastRatio(palette.inkLow, palette.ground);
    expect(ink).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(low);
  });
});
```

`packages/ui/test/tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { palette } from "../src/palette.js";

const css = readFileSync(fileURLToPath(new URL("../src/tokens.css", import.meta.url)), "utf8");

const TOKEN_NAMES: Record<keyof typeof palette, string> = {
  ground: "--ground",
  raised: "--raised",
  line: "--line",
  ink: "--ink",
  inkMid: "--ink-mid",
  inkLow: "--ink-low",
  accent: "--accent",
};

describe("tokens.css", () => {
  it("declares every palette value with the exact hex from TypeScript", () => {
    for (const [key, cssName] of Object.entries(TOKEN_NAMES)) {
      const expected = palette[key as keyof typeof palette];
      const match = css.match(new RegExp(`${cssName}\\s*:\\s*(#[0-9a-fA-F]{6})`));
      expect(match, `${cssName} missing from tokens.css`).not.toBeNull();
      expect(match?.[1]?.toLowerCase()).toBe(expected.toLowerCase());
    }
  });

  it("never uses pure black or pure white", () => {
    expect(css).not.toMatch(/#000000|#ffffff/i);
  });

  it("contains no em dashes", () => {
    expect(/[\u2013\u2014]/.test(css)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- contrast tokens`
Expected: FAIL, `Cannot find module '../src/contrast.js'`.

- [ ] **Step 3: Write the implementation**

`packages/ui/src/contrast.ts`:

```ts
function channel(value: number): number {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance for a six-digit hex color. */
export function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) throw new Error(`Expected a six-digit hex color, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(Number.parseInt(clean.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.1 contrast ratio. Ranges from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}
```

`packages/ui/src/palette.ts`:

```ts
/**
 * "Archive": warm near-black and brass.
 * Every text value is verified against the ground and raised surfaces at
 * WCAG AA in packages/ui/test/contrast.test.ts. Do not edit a value here
 * without running that suite.
 */
export const palette = {
  ground: "#0c0b09",
  raised: "#151310",
  line: "#282420",
  ink: "#efe9df",
  inkMid: "#a09689",
  inkLow: "#827868",
  accent: "#c4913c",
} as const;

/** One secondary hue per world page. The hub itself uses the brass accent alone. */
export const worldAccents = {
  work: "#c4913c",
  art: "#7c9c8b",
  music: "#c4634c",
  writing: "#cdbfa3",
} as const;
```

`packages/ui/src/tokens.css`:

```css
/* Archive design system. Dark only, by deliberate choice.
   Hex values are mirrored from packages/ui/src/palette.ts and a test
   fails if the two ever drift apart. */
:root {
  --ground: #0c0b09;
  --raised: #151310;
  --line: #282420;
  --ink: #efe9df;
  --ink-mid: #a09689;
  --ink-low: #827868;
  --accent: #c4913c;

  --accent-work: #c4913c;
  --accent-art: #7c9c8b;
  --accent-music: #c4634c;
  --accent-writing: #cdbfa3;

  --font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-body: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;

  --step--1: 0.833rem;
  --step-0: 1rem;
  --step-1: 1.2rem;
  --step-2: 1.44rem;
  --step-3: 1.728rem;
  --step-4: 2.074rem;
  --step-5: 2.488rem;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --space-6: 4rem;
  --space-7: 6rem;

  --radius-sm: 2px;
  --radius-md: 3px;
  --measure: 65ch;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`packages/ui/src/index.ts`:

```ts
export * from "./palette.js";
export * from "./contrast.js";
```

- [ ] **Step 4: Delete the smoke test and run the suite**

```bash
rm packages/ui/test/smoke.test.ts
```

Run: `npm test`
Expected: all suites pass, including 11 in the contrast and token files.

- [ ] **Step 5: Commit and push**

```bash
git add -A packages/ui
git commit -m "feat(ui): add Archive tokens with enforced WCAG AA contrast"
git push
```

`git add -A` stages the deletion of `smoke.test.ts` along with the new files.

---

### Task 7: Two Astro site shells

**Files:**
- Create: `sites/main/package.json`, `sites/main/astro.config.mjs`, `sites/main/tsconfig.json`, `sites/main/src/pages/index.astro`, `sites/main/src/layouts/Base.astro`
- Create: the same five files under `sites/technical/`
- Create: `sites/main/public/.nojekyll`, `sites/technical/public/.nojekyll`

**Interfaces:**
- Consumes: `projects`, `featuredProjects`, `domainsInUse` from Task 4; `tokens.css` from Task 6.
- Produces: two builds under `sites/*/dist`, each rendering real project data. Phase 2 and Phase 3 build their routes on top of these shells.

This task proves the whole architecture: a site importing shared content at build time with no network fetch.

- [ ] **Step 1: Create the main site manifest**

`sites/main/package.json`:

```json
{
  "name": "@portfolio/site-main",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@portfolio/content": "*",
    "@portfolio/ui": "*",
    "@fontsource/archivo": "^5.3.0",
    "@fontsource/jetbrains-mono": "^5.3.0",
    "astro": "^7.2.7"
  }
}
```

`sites/technical/package.json` is identical except `"name": "@portfolio/site-technical"`.

- [ ] **Step 2: Create both Astro configs**

`sites/main/astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kurtlylepaulino.github.io",
  base: "/PaulinoPortfolio",
  output: "static",
  trailingSlash: "ignore",
});
```

`sites/technical/astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kurtlylepaulino.github.io",
  base: "/PaulinoPortfolio/technical",
  output: "static",
  trailingSlash: "ignore",
});
```

`sites/main/tsconfig.json` and `sites/technical/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create the shared layout for the main site**

`sites/main/src/layouts/Base.astro`:

```astro
---
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@portfolio/ui/tokens.css";

interface Props { title: string; description: string; }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Create the identical file at `sites/technical/src/layouts/Base.astro`.

- [ ] **Step 4: Create both index pages**

`sites/main/src/pages/index.astro`:

```astro
---
import { domainsInUse, featuredProjects, projects } from "@portfolio/content";
import Base from "../layouts/Base.astro";
---
<Base title="Kurt Lyle Paulino" description="Developer. Machine learning, tools, and games.">
  <main>
    <h1>Kurt Lyle Paulino</h1>
    <p>{projects.length} projects, {featuredProjects.length} featured.</p>
    <ul>
      {projects.map((project) => (
        <li>{project.title} ({project.domain}, {project.year})</li>
      ))}
    </ul>
    <p>Domains: {domainsInUse().join(", ")}</p>
  </main>
</Base>
```

`sites/technical/src/pages/index.astro` is the same with `title="Kurt Lyle Paulino: Technical"`.

This page is scaffolding. Phase 2 replaces it with the real hero and selected-work sections.

- [ ] **Step 5: Add the Pages guards**

```bash
mkdir -p sites/main/public sites/technical/public
touch sites/main/public/.nojekyll sites/technical/public/.nojekyll
```

- [ ] **Step 6: Install and build both sites**

Run: `npm install && npm run build`
Expected: both builds complete and report generated pages. If Astro reports a Node version error, Task 1 Step 3 did not take effect in this shell.

- [ ] **Step 7: Verify the built output contains real data**

Run: `grep -c "Circuit Breakers" sites/main/dist/index.html sites/technical/dist/index.html`
Expected: each file reports `1` or more. This proves build-time content sharing works and neither site fetches data at runtime.

- [ ] **Step 8: Verify no runtime fetch of project data exists**

Run: `grep -rn "projects.json" sites/ --include=*.astro --include=*.js --include=*.ts || echo "clean"`
Expected: `clean`. Any hit means the old runtime-fetch pattern crept back in.

- [ ] **Step 9: Commit, push, and merge the phase**

```bash
git add sites/ package-lock.json
git commit -m "feat(sites): add main and technical Astro shells consuming shared content"
git push

npm test && npm run build
git checkout main
git merge --no-ff phase/1-foundation -m "Merge phase 1: foundation"
git tag phase-1
git push origin main --tags
```

Merge only if `npm test` and `npm run build` both succeed.

---

## Phase 1 Done When

- [ ] `node -v` reports 22.12.0 or higher
- [ ] `npm test` passes every suite
- [ ] `npm run build` produces `sites/main/dist` and `sites/technical/dist`
- [ ] Both built pages contain real project titles
- [ ] No reference to `projects.json` exists anywhere under `sites/`
- [ ] A project with an em dash in its copy fails the build
- [ ] `main` carries the `phase-1` tag and is pushed

## Not In This Phase

Real page design, the four world pages, the art gallery, the music player, case studies, embedded demos, the ffmpeg audio pipeline, image optimization, and GitHub Actions. Those belong to Phases 2 through 4, each of which gets its own plan.
