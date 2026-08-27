# Phase 2a: Shared Shell and Home Page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stage the image assets, extract a shared component layer both sites use, and build the real main-site home page against it.

**Architecture:** A new `packages/ui/components/` holds Astro components shared by both sites, eliminating the duplicated `Base.astro`. Images move to a shared `media/` directory at the repo root, which the main site serves as its `publicDir`. The home page is assembled from five sections, each a separate component, so a section can be understood and changed without reading the others.

**Tech Stack:** Astro 7.2.x, TypeScript 7.x, plain CSS custom properties, Vitest 4.x.

## Global Constraints

- **Node >= 22.12.0.** Currently 24.19.0.
- **Zero literal em dashes (U+2014) and en dashes (U+2013)** in any file, including comments and commit messages. Use `\u2014` / `\u2013` escapes. A repo-wide grep must stay clean.
- **Dark theme only.** No light mode, no `prefers-color-scheme`, no toggle.
- **No CSS framework.** Plain CSS using the tokens in `packages/ui/src/tokens.css`.
- **Never hardcode a content count.** No `slice(0, 3)` on featured projects, no fixed grid cell counts, no copy saying "three projects" or "seven". Everything derives from data length.
- **Never introduce a colour outside the token set.** Every colour comes from a `var(--*)` token. No new hex values anywhere in a component.
- **All text must clear WCAG AA.** The palette guarantees this only if you use the tokens as intended: `--ink` and `--ink-mid` on `--ground` or `--raised`. Never put `--ink-low` on anything but those two surfaces.
- **Base paths:** main site is served under `/PaulinoPortfolio`. Never hardcode that string. Use `import.meta.env.BASE_URL` or Astro's path helpers for every internal link and asset URL.
- **Branch:** all Phase 2a work happens on `phase/2a-shell-and-home`. Push after every task. Never force-push.

---

## Design Specification

This section is the visual authority for the whole phase. Tasks reference it rather than restating it. Implementers must not invent layout, spacing, or type decisions not written here; if something is genuinely unspecified, stop and ask.

### D1. Layout families, and why they must differ

The home page has five sections. A generic AI-built page gives every section the same treatment and the result reads as a template. Each section below uses a **different** structural family, and no family repeats:

| # | Section | Layout family |
|---|---|---|
| 1 | Hero | Asymmetric split: type left, single image right |
| 2 | Selected work | One wide feature row, then a two-up row beneath |
| 3 | Credentials | Horizontal band of facts, hairline separated, no cards |
| 4 | The four worlds | Two-by-two tile grid, each tile carrying its own accent |
| 5 | About and contact | Two columns, prose left at measure, links right |

**Banned outright:** three equal feature cards in a row; a centered hero; any section whose structure repeats another's.

### D2. Eyebrow budget

An "eyebrow" is the small uppercase wide-tracking label above a heading. Overusing them is the single most recognizable AI-design tell. **The home page gets exactly one, in the hero.** No other section has one. Section headings stand alone.

Specifically banned: numbered eyebrows (`01 / WORK`), status eyebrows (`BETA`), and locale or time strips.

### D3. Type scale usage

Use only the existing `--step-*` tokens. Do not introduce new sizes.

| Role | Token | Weight | Tracking | Leading |
|---|---|---|---|---|
| Hero headline | `--step-5` at mobile, scaling to `clamp(2.488rem, 1.6rem + 3.4vw, 4rem)` | 700 | `-0.035em` | `1.03` |
| Section heading | `--step-3` | 700 | `-0.025em` | `1.1` |
| Project title | `--step-1` | 600 | `-0.015em` | `1.2` |
| Body | `--step-0` | 400 | normal | `1.6` |
| Metadata, years, counts | `--step--1` | 400, `--font-mono` | `0.02em` | `1.4` |
| Eyebrow (hero only) | `--step--1` | 500, `--font-mono` | `0.2em`, uppercase | `1` |

Body text is capped at `--measure` (65ch). Headings get `text-wrap: balance`.

### D4. Spacing

Section vertical rhythm uses `--space-7` (6rem) between sections at desktop, `--space-6` (4rem) at mobile. Within a section, `--space-4` between a heading and its content, `--space-3` between sibling items.

The page container is `max-width: var(--container)`, centered, with `padding-inline: var(--gutter)`. Both are defined in `tokens.css`. Never repeat the underlying values in a component.

### D5. Hero, exactly

Left column (about 55% at desktop), in order and nothing more:

1. Eyebrow: `Developer`
2. Headline: **I build machine learning, tools, and games.**
3. Subtext, 20 words: `Computer Science, De La Salle Lipa. A melanoma classifier at 90% accuracy, an award winning Unity thesis, shipped web apps.`
4. Two links: `See the work` (primary, to `/work`) and `Resume` (secondary)

Right column: one artwork, `object-fit: cover`, `aspect-ratio: 4/5`, `border-radius: var(--radius-md)`, a `1px solid var(--line)` border, no shadow. Pick it by id from the `artwork` collection so it is stable across builds, not random.

**Hard rules.** The headline is at most two lines at desktop. There are exactly four text elements; nothing else goes in the hero. No trust strip, no tagline under the buttons, no scroll cue, no stat row. At viewports under 768px the columns stack, image second.

### D6. Selected work, exactly

Heading: `Selected work`. No eyebrow.

Derive the list from `featuredProjects`. Do not assume its length. Render the **first** entry as a wide feature row and the **remainder** in a grid whose column count is `min(remainder.length, 2)`. With today's data that is one wide row plus two beneath, but it stays correct if the featured set changes.

Feature row: image left at `aspect-ratio: 16/10`, text right. Title, award line if present, blurb, stack chips, one link.
Standard cell: title, year, blurb, stack chips.

Chips use `--font-mono` at `--step--1`, `1px solid var(--line)`, `--radius-sm`, `--ink-low` text. They are labels, not buttons; no hover lift.

The section ends with a single link reading `All work` to `/work`. **Not** a second call to action with the same intent as any hero link.

### D7. Credentials, exactly

A horizontal band, no cards, no boxes. Three facts separated by hairline `1px solid var(--line)` dividers, wrapping to a column under 768px:

- `BSCS` / De La Salle Lipa, game development track
- `3` / thesis awards: Best Thesis, Best Paper, Best Presenter
- `4` / languages shipped: C#, Python, JavaScript, TypeScript

Values in `--font-mono` at `--step-3`, labels in `--ink-mid` at `--step--1`. Numerals get `font-variant-numeric: tabular-nums`.

Do not invent a fact. Everything here is checkable against the résumé and the project data.

### D8. The four worlds, exactly

Heading: `Four worlds`. A two-by-two grid, equal cell size, `gap: var(--space-3)`. Four cells for four worlds; never an empty cell.

Each tile: a representative image at `aspect-ratio: 3/2`, a title, a one-line description, and a count derived from the data. The tile's accent comes from the matching `--accent-*` token and is used for exactly one thing: a `2px` top border on the tile. Nothing else on the tile is accented.

| Tile | Accent token | Description | Count source |
|---|---|---|---|
| Work | `--accent-work` | Games, machine learning, tools, and the web. | `projects.length` |
| Art | `--accent-art` | Character studies, battle maps, and motion pieces. | `artworks.length` |
| Music | `--accent-music` | Originals, a campaign score, and fan works. | `tracks.length` |
| Writing | `--accent-writing` | Canrael: a dark fantasy world, seven years in. | `writings.length` |

Counts render as `83 pieces`, `40 tracks`, and so on, in `--font-mono` at `--step--1`, `--ink-low`.

**The Writing tile is labelled "Writing", never "Canrael".** Canrael is the subject, not the label.

### D9. About and contact, exactly

Two columns at desktop, stacked under 768px. Heading `About`.

Left, prose at `--measure`, two paragraphs, and this is the final copy:

> I am a Computer Science graduate from De La Salle Lipa, where I took the game development track. My thesis, Circuit Breakers, is a 2D cybersecurity roguelike built in Unity. It won Best Thesis, Best Paper, and Best Presenter, and I was lead author on the paper.
>
> I also trained a convolutional neural network that reads dermoscopic images above 90% accuracy, and I have shipped several front end web apps. Outside of code I write music, generate visual art, and keep building Canrael.

Right: a plain list of links, one per line, in `--font-mono` at `--step-0`: GitHub, LinkedIn, Email, Resume. No icons, no cards, no social buttons.

### D10. Motion

Minimal and motivated. Exactly one effect on this page: a scroll-triggered fade and 12px rise on each section as it enters the viewport, staggered by nothing, duration 500ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`. Implement with `IntersectionObserver` in a single small script, or CSS `animation-timeline: view()` where supported.

**No** parallax, magnetic buttons, marquees, infinite loops, custom cursors, or hover lifts on cards. Everything sits behind `prefers-reduced-motion: reduce`, which `tokens.css` already handles globally; verify it actually suppresses the effect.

### D11. Copy rules

Every visible string obeys the project's copy rules: no em dashes, no filler openers, active voice, checkable claims. The strings in D5, D8, and D9 are final and must be transcribed exactly, not reworded.

---

## File Structure

| File | Responsibility |
|---|---|
| `media/` | Shared static assets at repo root. Main site's `publicDir`. |
| `media/.nojekyll` | Stops GitHub Pages from processing the output. |
| `media/img/art/**` | 166 WebP files, staged from the previous site. |
| `media/img/projects/**` | 5 project images. |
| `packages/ui/components/BaseLayout.astro` | The single HTML shell both sites use. Replaces two duplicates. |
| `packages/ui/components/SiteNav.astro` | Top navigation. One line, height capped. |
| `packages/ui/components/SiteFooter.astro` | Footer. |
| `packages/ui/components/Reveal.astro` | The one scroll-reveal behaviour from D10. |
| `packages/ui/package.json` | Gains a `./components/*` export path. |
| `sites/main/src/components/HeroSection.astro` | D5. |
| `sites/main/src/components/SelectedWork.astro` | D6. |
| `sites/main/src/components/Credentials.astro` | D7. |
| `sites/main/src/components/WorldsGrid.astro` | D8. |
| `sites/main/src/components/AboutContact.astro` | D9. |
| `sites/main/src/pages/index.astro` | Assembles the five sections. Little else. |
| `scripts/stage-images.mjs` | One-off, re-runnable copy of image assets. |
| `packages/ui/test/components.test.ts` | Structural assertions on the shared components. |
| `sites/main/test/home.test.ts` | Assertions against the built home page HTML. |

One component per section keeps each file small enough to hold in context and change independently.

---

### Task 1: Stage the image assets

**Files:**
- Create: `scripts/stage-images.mjs`, `media/.nojekyll`
- Modify: `sites/main/astro.config.mjs`, `.gitignore` if needed
- Delete: `sites/main/public/.nojekyll` (superseded by `media/.nojekyll`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: every path referenced by `art.json` and by each project's `media` field resolves to a real file under `media/`.

**Why this is first.** `packages/content` already references paths like `img/art/artwork/artwork-01.webp`, and none of those files exist in this repo. Until they do, no page can be built or looked at.

**Source, read-only:** `E:\CLAUDE WORKSTATION\PortFolio\FullPortfolio\assets\`. Never write there.

- [ ] **Step 1: Write the failing test**

`sites/main/test/assets.test.ts`:

```ts
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { artworks, projects } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const mediaRoot = fileURLToPath(new URL("../../../media/", import.meta.url));

describe("staged media", () => {
  it("has a file for every artwork full image and thumbnail", () => {
    const missing = artworks.flatMap((a) =>
      [a.src, a.thumb].filter((p) => !existsSync(mediaRoot + p)),
    );
    expect(missing).toEqual([]);
  });

  it("has a file for every project image", () => {
    const missing = projects
      .map((p) => p.media)
      .filter((m): m is string => typeof m === "string")
      .filter((m) => !existsSync(mediaRoot + m));
    expect(missing).toEqual([]);
  });
});
```

Add `sites/**/test/**/*.test.ts` to the `include` array in `vitest.config.ts` so this suite runs.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- assets`
Expected: FAIL, listing 166 missing artwork paths.

- [ ] **Step 3: Write the staging script**

`scripts/stage-images.mjs`. Requirements:

- Source root defaults to the path above, overridable with `PORTFOLIO_SOURCE_DIR`.
- Copies `assets/img/art/**` to `media/img/art/**` and `assets/img/projects/**` to `media/img/projects/**`, preserving structure.
- **Derives its work list from the content package**, not from a directory walk, so a file the data does not reference is never copied and a referenced file that is missing at source is reported loudly rather than skipped silently.
- Idempotent: re-running copies nothing new and reports that.
- Prints a summary: files copied, files already present, total bytes.
- Exits non-zero if any referenced source file is missing.

Run it: `node scripts/stage-images.mjs`

- [ ] **Step 4: Point the main site at the shared media directory**

In `sites/main/astro.config.mjs`, add `publicDir: "../../media"` alongside the existing options. Create `media/.nojekyll` and delete `sites/main/public/.nojekyll`.

Leave `sites/technical` untouched. Phase 3 decides how it reaches shared assets; duplicating 24 MB into a second `dist` is the thing to avoid, and both sites deploy under one Pages site so absolute paths will resolve.

- [ ] **Step 5: Verify**

Run: `npm test -- assets`
Expected: PASS.

Run: `npm run build`
Expected: both sites build. Then confirm the assets actually landed in the output:

```bash
node -e "const{existsSync}=require('fs');const p='sites/main/dist/img/art/artwork/artwork-01.webp';console.log(p, existsSync(p)?'served':'MISSING');"
```

Expected: `served`.

- [ ] **Step 6: Commit and push**

```bash
git checkout -b phase/2a-shell-and-home
git add -A
git commit -m "feat(media): stage image assets into a shared media directory"
git push -u origin phase/2a-shell-and-home
```

Note this commit adds roughly 24 MB of binary assets. That is expected and is the reason the repo will grow.

---

### Task 2: Extract the shared layout

**Files:**
- Create: `packages/ui/components/BaseLayout.astro`
- Modify: `packages/ui/package.json` (add `./components/*` export)
- Delete: `sites/main/src/layouts/Base.astro`, `sites/technical/src/layouts/Base.astro`
- Modify: both `src/pages/index.astro` to import the shared layout

**Interfaces:**
- Consumes: `@portfolio/ui/tokens.css`.
- Produces: `@portfolio/ui/components/BaseLayout.astro`, taking props `{ title: string; description: string; }` and rendering a `<slot />`.

**Why.** The two `Base.astro` files are byte-identical duplicates. Phase 1 removed cross-site data drift and introduced cross-site layout drift in its place. This closes that.

- [ ] **Step 1: Add the export path**

In `packages/ui/package.json`, add to `exports`:

```json
    "./components/*": "./components/*"
```

- [ ] **Step 2: Create the shared layout**

`packages/ui/components/BaseLayout.astro`. Start from the existing `sites/main/src/layouts/Base.astro` content verbatim, then extend the `<head>` with the metadata a real page needs:

```astro
---
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@portfolio/ui/tokens.css";

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

The extra font weights are needed by D3. Verify each `@fontsource` weight file exists before importing it; if a weight is unavailable, report it rather than silently dropping the import.

- [ ] **Step 3: Point both sites at it and delete the duplicates**

Both `index.astro` files import `BaseLayout` from `@portfolio/ui/components/BaseLayout.astro`. Delete both old layout files.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: both sites build.

```bash
git ls-files | grep -c "layouts/Base.astro"
```
Expected: `0`.

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "refactor(ui): extract the duplicated Base layout into packages/ui"
git push
```

---

### Task 3: Navigation and footer

**Files:**
- Create: `packages/ui/components/SiteNav.astro`, `packages/ui/components/SiteFooter.astro`
- Test: `packages/ui/test/components.test.ts`

**Interfaces:**
- Consumes: `BaseLayout` from Task 2.
- Produces: `SiteNav` taking `{ current?: string }` to mark the active link, and `SiteFooter` taking no props.

**Design.** Nav is a single row: brand on the left, links on the right. Height is capped at 72px and must never wrap to two lines at any viewport at or above 1024px. Under 768px the links collapse to a single row beneath the brand, still one line each. Do not build a hamburger menu; there are only four links.

Links: Work, Art, Music, Writing. The brand reads `Kurt Lyle Paulino` and links home. The active link is marked with `aria-current="page"` and rendered in `--ink`; inactive links are `--ink-mid`.

Every href is built from `import.meta.env.BASE_URL`. No literal `/PaulinoPortfolio`.

Footer: one line of `--ink-low` text at `--step--1` with the name and the current year, plus the same four links. No social icons, no version string, no build info, no locale or time strip.

- [ ] **Step 1: Write the failing test**

`packages/ui/test/components.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../components/${name}`, import.meta.url)), "utf8");

describe("SiteNav", () => {
  const src = read("SiteNav.astro");

  it("builds hrefs from BASE_URL rather than hardcoding the deploy path", () => {
    expect(src).toContain("BASE_URL");
    expect(src).not.toContain("/PaulinoPortfolio");
  });

  it("marks the active link for assistive technology", () => {
    expect(src).toContain("aria-current");
  });

  it("caps its height so it cannot eat the viewport", () => {
    expect(src).toMatch(/max-height|height:\s*\d/);
  });
});

describe("SiteFooter", () => {
  const src = read("SiteFooter.astro");

  it("does not hardcode the deploy path", () => {
    expect(src).not.toContain("/PaulinoPortfolio");
  });
});

describe("shared components", () => {
  it("introduce no colour outside the token set", () => {
    for (const name of ["SiteNav.astro", "SiteFooter.astro", "BaseLayout.astro"]) {
      expect(read(name)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("contain no literal em or en dash", () => {
    for (const name of ["SiteNav.astro", "SiteFooter.astro", "BaseLayout.astro"]) {
      expect(/[\u2013\u2014]/.test(read(name))).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- components`
Expected: FAIL, cannot read `SiteNav.astro`.

- [ ] **Step 3: Build the components**

Follow the design above. All colour via `var(--*)`. Nav uses `--ground` background with a `1px solid var(--line)` bottom border, `position: sticky; top: 0`, and a `z-index` of 10. Do not add a backdrop blur.

- [ ] **Step 4: Verify**

Run: `npm test -- components`
Expected: PASS.

Run: `npm run build`
Expected: both sites build.

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "feat(ui): add shared navigation and footer"
git push
```

---

### Task 4: Hero and Selected work

**Files:**
- Create: `sites/main/src/components/HeroSection.astro`, `sites/main/src/components/SelectedWork.astro`
- Create: `packages/ui/components/Reveal.astro`
- Modify: `sites/main/src/pages/index.astro`
- Test: `sites/main/test/home.test.ts`

**Interfaces:**
- Consumes: `featuredProjects`, `artworks` from `@portfolio/content`; `BaseLayout`, `SiteNav`, `SiteFooter` from `@portfolio/ui/components/`.
- Produces: two page sections and the single reveal behaviour from D10.

Build exactly to **D5** and **D6**. The copy strings in D5 are final; transcribe them.

**The rule most likely to be broken here:** D6 says derive the feature row and the remainder from `featuredProjects` without assuming its length. Writing `featuredProjects[0]` plus `featuredProjects.slice(1)` is correct. Writing a fixed three-cell grid, or `slice(0, 3)`, is not.

- [ ] **Step 1: Write the failing test**

`sites/main/test/home.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { featuredProjects } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const html = () =>
  readFileSync(fileURLToPath(new URL("../dist/index.html", import.meta.url)), "utf8");

describe("home page", () => {
  it("names the role before anything else", () => {
    const doc = html();
    expect(doc).toContain("Developer");
    expect(doc).toContain("I build machine learning, tools, and games.");
  });

  it("renders every featured project and no others", () => {
    const doc = html();
    for (const project of featuredProjects) {
      expect(doc).toContain(project.title);
    }
  });

  it("keeps the hero subtext within the twenty word budget plus a small margin", () => {
    const doc = html();
    const match = doc.match(/Computer Science, De La Salle Lipa\.[^<]*/);
    expect(match).not.toBeNull();
    expect(match![0].trim().split(/\s+/).length).toBeLessThanOrEqual(24);
  });

  it("ships no literal em or en dash", () => {
    expect(/[\u2013\u2014]/.test(html())).toBe(false);
  });

  it("gives every image alt text", () => {
    const imgs = html().match(/<img\b[^>]*>/g) ?? [];
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img).toMatch(/\balt=/);
  });
});
```

This suite reads built output, so `npm run build` must run before `npm test`. Note that ordering in the task's verification steps.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run build && npm test -- home`
Expected: FAIL on the headline assertion, since the placeholder page does not contain it.

- [ ] **Step 3: Build `Reveal.astro`**

A wrapper component rendering a `<div class="reveal">` around its slot, plus one inline script using `IntersectionObserver` to add a `.is-visible` class. The CSS applies `opacity: 0; transform: translateY(12px)` initially and transitions both over 500ms with `cubic-bezier(0.16, 1, 0.3, 1)`.

Guard it: if `matchMedia("(prefers-reduced-motion: reduce)").matches`, add `.is-visible` immediately and never observe. Content must be visible even with JavaScript disabled, so the initial hidden state is applied by the script, not by the stylesheet.

- [ ] **Step 4: Build the two sections**

To D5 and D6 exactly.

- [ ] **Step 5: Assemble the page**

`index.astro` imports `BaseLayout`, `SiteNav`, `HeroSection`, `SelectedWork`, `SiteFooter` and renders them in order. It contains no layout CSS of its own beyond the page container from D4.

- [ ] **Step 6: Verify**

Run: `npm run build && npm test`
Expected: everything passes.

- [ ] **Step 7: Commit and push**

```bash
git add -A
git commit -m "feat(main): add hero and selected work sections"
git push
```

---

### Task 5: Credentials and the four worlds

**Files:**
- Create: `sites/main/src/components/Credentials.astro`, `sites/main/src/components/WorldsGrid.astro`
- Modify: `sites/main/src/pages/index.astro`, `sites/main/test/home.test.ts`

**Interfaces:**
- Consumes: `projects`, `artworks`, `tracks`, `writings` from `@portfolio/content`.
- Produces: two more page sections.

Build exactly to **D7** and **D8**.

**The rules most likely to be broken here:** every count in D8 is derived from data length, never typed as a literal. Each tile uses its own accent for the top border and for nothing else. The fourth tile is labelled `Writing`.

- [ ] **Step 1: Add the failing assertions**

**Extend the existing import** at the top of `sites/main/test/home.test.ts` rather than adding a second import statement from the same module:

```ts
import { artworks, featuredProjects, projects, tracks, writings } from "@portfolio/content";
```

Then append:

```ts
describe("the four worlds", () => {
  it("shows each world with its own description", () => {
    const doc = html();
    // These strings are unique to the worlds grid. Asserting on the labels
    // alone would pass on the nav links, which carry the same four words.
    expect(doc).toContain("Games, machine learning, tools, and the web.");
    expect(doc).toContain("Character studies, battle maps, and motion pieces.");
    expect(doc).toContain("Originals, a campaign score, and fan works.");
    expect(doc).toContain("Canrael: a dark fantasy world, seven years in.");
  });

  it("labels the fourth world Writing rather than Canrael", () => {
    const doc = html();
    const canraelDescription = "Canrael: a dark fantasy world";
    const index = doc.indexOf(canraelDescription);
    expect(index).toBeGreaterThan(-1);
    // The tile's heading sits above its description. Look back a short way
    // and confirm the label is Writing, not the world's proper noun.
    const preceding = doc.slice(Math.max(0, index - 400), index);
    expect(preceding).toContain("Writing");
  });

  it("derives every count from the data", () => {
    const doc = html();
    expect(doc).toContain(`${projects.length} projects`);
    expect(doc).toContain(`${artworks.length} pieces`);
    expect(doc).toContain(`${tracks.length} tracks`);
    expect(doc).toContain(`${writings.length} documents`);
  });

  it("states the awards without inventing a number", () => {
    expect(html()).toContain("Best Thesis");
  });
});
```

The count assertions pair each number with its unit deliberately. Asserting on a bare
`String(projects.length)` would pass on any incidental `7` anywhere in the document, which is
the kind of test that looks green while checking nothing.

- [ ] **Step 2: Run and watch it fail**

Run: `npm run build && npm test -- home`

- [ ] **Step 3: Build both sections, to D7 and D8**

- [ ] **Step 4: Add them to `index.astro`, in order after Selected work**

- [ ] **Step 5: Verify**

Run: `npm run build && npm test`

- [ ] **Step 6: Commit and push**

```bash
git add -A
git commit -m "feat(main): add credentials band and the four worlds grid"
git push
```

---

### Task 6: About, contact, and the whole-page pass

**Files:**
- Create: `sites/main/src/components/AboutContact.astro`
- Modify: `sites/main/src/pages/index.astro`, `sites/main/test/home.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: the finished home page.

Build exactly to **D9**. The two paragraphs are final copy; transcribe them.

- [ ] **Step 1: Add the failing assertions**

Append to `sites/main/test/home.test.ts`:

```ts
describe("page discipline", () => {
  it("uses exactly one eyebrow, in the hero", () => {
    const doc = html();
    const eyebrows = doc.match(/class="[^"]*\beyebrow\b[^"]*"/g) ?? [];
    expect(eyebrows).toHaveLength(1);
  });

  it("has exactly one h1", () => {
    expect((html().match(/<h1\b/g) ?? [])).toHaveLength(1);
  });

  it("introduces no colour outside the token set", () => {
    const doc = html();
    const inlineHex = doc.match(/style="[^"]*#[0-9a-fA-F]{3,8}/g) ?? [];
    expect(inlineHex).toEqual([]);
  });

  it("never hardcodes the deploy path in a link", () => {
    const doc = html();
    const hardcoded = (doc.match(/href="\/PaulinoPortfolio/g) ?? []).length;
    const total = (doc.match(/href="/g) ?? []).length;
    expect(total).toBeGreaterThan(0);
    expect(hardcoded).toBeLessThanOrEqual(total);
  });
});
```

- [ ] **Step 2: Run and watch the eyebrow count fail**

If it reports more than one eyebrow, the extra ones violate D2 and must be removed, not accommodated by loosening the test.

- [ ] **Step 3: Build the section and assemble the final page**

- [ ] **Step 4: Full verification**

Run each and record the output:

```bash
npm run build
npm test
npm run typecheck
```

Then the repo-wide dash check:

```bash
node -e "
const {execSync}=require('child_process');
const files=execSync('git ls-files',{encoding:'utf8'}).trim().split('\n').filter(f=>/\.(ts|js|mjs|css|astro|json)$/.test(f));
let bad=0; for(const f of files){if(/[\u2013\u2014]/.test(require('fs').readFileSync(f,'utf8'))){console.log('LITERAL:',f);bad++;}}
console.log(bad?'FAIL':'clean ('+files.length+' files)');"
```

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "feat(main): add about and contact, completing the home page"
git push
```

---

## Phase 2a Done When

- [ ] Every image path referenced by the content package resolves to a real file
- [ ] `sites/main/dist/img/art/artwork/artwork-01.webp` exists after a build
- [ ] No `layouts/Base.astro` remains in either site
- [ ] The home page renders all five sections in the order given by D1
- [ ] Exactly one eyebrow and exactly one `h1` on the page
- [ ] Every count on the page derives from data length
- [ ] Every image has alt text
- [ ] No colour outside the token set appears in any component
- [ ] No literal em dash or en dash anywhere in the repo
- [ ] `npm test`, `npm run build`, and `npm run typecheck` all pass
- [ ] Branch merged to `main` and tagged `phase-2a`

## Not In This Phase

The `/work` index and project detail pages (2b). The art gallery, music player, and writing index (2c). Anything on the technical site (Phase 3). The audio re-encode and GitHub Actions deployment (Phase 4).
