# Phase 2b: The Work Routes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Read the process note in section P before dispatching anything.** This phase deliberately does not run the same review pipeline Phase 2a used.

**Goal:** Build `/work`, the full project index with working domain filters, and `/work/[id]`, a detail page per project.

**Architecture:** Two new routes on the main site, built from the existing shared component layer. The index derives its filter set from the data rather than a hardcoded list, so a new project or a new domain needs no code change. Filtering is CSS only, no client framework. Detail pages are statically generated with `getStaticPaths` from the same content package.

**Tech Stack:** Astro 7.2.x, TypeScript 7.x, plain CSS custom properties, Vitest 4.x.

---

## P. Process note, read before dispatching

Phase 2a ran an implementer, a reviewer, often a fixer, and a re-review on every task. That pipeline caught three real defects where a check reported success while verifying nothing. It also caught nothing aesthetic, and the first page shipped flat because no one looked at it until the end.

So this phase splits by what the work actually needs:

- **Data, routing, and filter derivation** keep the full loop: TDD, an implementer, and a reviewer. These are the parts where a silent failure is invisible.
- **Anything visual** runs: implementer, then build, then deploy, then *look at it*, then iterate. **No review agents on visual tasks.** They cannot see, so they add cost and no signal.

Every visual task below ends with a deploy and a look, not a review dispatch. The site auto-deploys from `main` and from any branch push only after merge, so during the phase use `npm run build` plus a local look, and deploy at the phase boundary.

---

## Global Constraints

- **Node >= 22.12.0.** Currently 24.19.0.
- **Zero literal em dashes (U+2014) and en dashes (U+2013)** in any file, including commit messages. Write them as `\u2014` and `\u2013` escapes, never the literal character. That includes any regex you write to detect them.
- **No colour outside the token set.** Every colour is a `var(--*)` or a `color-mix()` of tokens. No hex in a component.
- **Dark theme only.** No light mode, no toggle.
- **No CSS framework**, no utility classes. Scoped `<style>` per component.
- **Never hardcode `/PaulinoPortfolio`.** Build every href and asset URL from `import.meta.env.BASE_URL`.
- **Never hardcode a content count or a domain list.** Both derive from the data.
- **Reuse the shared layer.** `BaseLayout`, `SiteNav`, `SiteFooter`, `SectionHeading`, and `Reveal` already exist in `packages/ui/components/`. Do not write a second heading treatment or a second reveal.
- `npm test` builds first via `pretest` and refuses to run against a stale `dist`. Keep it that way.
- **Branch:** `phase/2b-work-routes`. Push after every task.

---

## Design Specification

### D1. The layout families already in use, and why that matters

The home page uses five structures, and repeating one here is what would make the site read as templated. **Neither new page may reuse these:**

| Existing | Where |
|---|---|
| Full bleed atmospheric field, type inside the light | Hero |
| Image beside or above copy, on a raised card | Selected work |
| Full bleed band on the raised surface | Credentials |
| Image backed tile with copy overlaid on top | Four worlds |
| Prose at measure beside a bordered link panel | About |

**The work index gets a sixth: a dense archival register.** Rows, not cards. Hairline separated, mono metadata in aligned columns, the project title as the only display-scale element per row. This suits the Archive direction better than another grid of cards would, and it is the one structure that scales when the project count grows.

**The detail page gets a seventh:** a full-bleed masthead carrying the project image and title, then a two-column body of narrative left and a metadata rail right.

### D2. Type and colour

Use the existing tokens. `--step-display` is the hero size and belongs only to the home page hero and the detail page masthead title. Section headings use `SectionHeading`. Metadata is `--font-mono` at `--step--1` in `--ink-low`.

**Domain colour.** Each domain gets one of the existing world accents so a reader learns the mapping across pages:

| Domain | Token |
|---|---|
| `game` | `--accent-work` |
| `ml` | `--accent-art` |
| `web` | `--accent-music` |
| `tool` | `--accent-writing` |

Do not add tokens for this. Map in one place, exported from a single module, so the index, the filters, and the detail pages agree.

### D3. `/work`, the index

**Header.** `SectionHeading` with text `Work`, size `large`. Beneath it, one line of `--ink-mid` stating the count, derived: `` `${projects.length} projects across ${domainsInUse().length} domains.` ``

**Filters.** A row of chips: `All`, then one per domain in `domainsInUse()`, labelled from the domain map. Each chip carries its domain's accent as a left border or underline when active.

**Filtering is CSS only.** Use a radio input group with `:checked` driving sibling visibility:

```
input[type="radio"] (visually hidden, one per domain plus All)
label.chip (styled, `for` the matching input)
.index (rows, each carrying data-domain)
```

Then `#filter-ml:checked ~ .index .row:not([data-domain="ml"]) { display: none; }` and so on, generated by mapping over the domains. No JavaScript. It works with JS disabled, it is keyboard navigable for free, and it needs no hydration.

Radio inputs must be **visually hidden but focusable**: never `display: none`, which removes them from the tab order. Use the clip pattern. The `:focus-visible` ring must appear on the label.

**Rows.** One per project, ordered by year descending then title. Each row:

- A thin domain stripe on the left edge, 2px, in that domain's accent
- Title at `--step-2`, display face
- Tagline at `--step-0` in `--ink-mid`, one line, truncated with ellipsis at narrow widths
- Year and domain label, mono, `--ink-low`, right aligned in their own column
- The whole row is one link to `/work/[id]`

**Row hover:** background lifts to `--raised`, the stripe goes to full opacity, the title shifts to the domain accent. No transform on rows; a list that jumps on hover is unpleasant to scan.

**Empty state.** If a filter matches nothing, a row of `--ink-low` text reading `No projects in this domain yet.` It must be pure CSS too: render it always, hidden unless its sibling rows are all hidden. If that proves impossible in CSS alone, leave it out and say so in the report rather than adding JavaScript.

**Do not paginate.** Seven projects, and a register scales to fifty.

### D4. `/work/[id]`, the detail page

Generated with `getStaticPaths` over `projects`. One page per project, including projects with no image and no demo.

**Masthead.** Full bleed. If the project has `media`, it is the backplate at the same damping the cards use, `saturate(0.72) brightness(0.5)`, with a vignette and a fade into the ground beneath. If it has no `media`, the masthead falls back to the hero's CSS atmosphere with the domain's accent substituted for `--accent` in the gradients. **A project without an image must still look deliberate.**

Inside the masthead, in order:
1. A back link, mono, `Work`, with a left arrow drawn in CSS
2. Eyebrow: the domain label in that domain's accent. This page's one eyebrow.
3. `h1` at `--step-display`: the project title
4. The tagline at `--step-1` in `--ink-mid`
5. The award line if present, mono, in the domain accent

**Body**, two columns at desktop, `1.6fr 1fr`, stacking under 768px:

*Left, narrative:*
- The `summary`, at `--measure`, `--step-0`, `--ink-mid`, first paragraph taking lead weight
- `Highlights` as a `SectionHeading` at default size, then the `highlights` array as a list. Not bullets: each item on its own row, hairline separated, with a small domain-accent marker drawn in CSS.

*Right, a metadata rail on the raised surface:*
- `metrics` as label and value pairs, values in mono at `--step-1`
- `Stack` as the existing chip treatment
- `links` as the bordered panel pattern from About, absolute hrefs opening in a new tab with `rel="noopener"`, relative ones not

**Omit any block whose data is absent.** A project with no `metrics` renders no metrics block, not an empty container with a heading.

**Prev and next.** At the foot, links to the adjacent projects in the index order, wrapping at the ends. Mono, with the titles.

### D5. Motion

Reuse `Reveal` on body sections. No new motion patterns. Hover states use `var(--ease)` and are gated behind `prefers-reduced-motion` as everywhere else.

### D6. What must not appear

No numbered eyebrows, no scroll cues, no version labels, no locale or time strips, no decorative status dots, no second eyebrow on either page, no card hover lift on index rows, no marquee, no pagination.

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/content/src/domains.ts` | The domain to label and accent map. One source for index, filters, and detail pages. |
| `sites/main/src/pages/work/index.astro` | The register and its CSS filters. |
| `sites/main/src/pages/work/[id].astro` | The detail page, via `getStaticPaths`. |
| `sites/main/src/components/WorkRow.astro` | One index row. |
| `sites/main/src/components/ProjectMasthead.astro` | D4 masthead, both the image and the no-image case. |
| `sites/main/src/components/MetaRail.astro` | Metrics, stack, and links rail. |
| `packages/content/test/domains.test.ts` | Every domain in use has a label and an accent. |
| `sites/main/test/work.test.ts` | Built output assertions for both routes. |

---

### Task 1: The domain map

**Files:** create `packages/content/src/domains.ts`, `packages/content/test/domains.test.ts`; modify `packages/content/src/index.ts`.

**This task keeps the full review loop.** It is data, and a silent gap here means a project renders with no colour and no label.

**Produces:**
- `DOMAIN_META: Record<Domain, { label: string; accent: string }>`
- `domainMeta(domain: Domain)` returning that entry, throwing on an unknown domain rather than returning a default

Labels: `game` to `Games`, `ml` to `Machine learning`, `web` to `Web`, `tool` to `Tools`. Accents per D2.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { DOMAINS, domainMeta, domainsInUse, projects } from "../src/index.js";

describe("domain metadata", () => {
  it("covers every domain the schema allows", () => {
    for (const domain of DOMAINS) {
      expect(domainMeta(domain).label.length).toBeGreaterThan(0);
      expect(domainMeta(domain).accent).toMatch(/^var\(--accent-/);
    }
  });

  it("covers every domain actually used by a project", () => {
    for (const domain of domainsInUse()) {
      expect(() => domainMeta(domain)).not.toThrow();
    }
  });

  it("gives each domain a distinct accent", () => {
    const accents = DOMAINS.map((d) => domainMeta(d).accent);
    expect(new Set(accents).size).toBe(accents.length);
  });

  it("throws on an unknown domain rather than guessing", () => {
    // @ts-expect-error deliberately invalid
    expect(() => domainMeta("music")).toThrow();
  });

  it("labels no domain with the raw key", () => {
    for (const domain of DOMAINS) {
      expect(domainMeta(domain).label).not.toBe(domain);
    }
  });
});
```

- [ ] **Step 2:** Run `npm test -- domains`, watch it fail on the missing module.
- [ ] **Step 3:** Implement, export from `index.ts`.
- [ ] **Step 4:** Run again, watch it pass.
- [ ] **Step 5:** Commit and push.

---

### Task 2: The work index

**Files:** create `sites/main/src/pages/work/index.astro`, `sites/main/src/components/WorkRow.astro`, `sites/main/test/work.test.ts`.

**Visual task.** Implementer, then build, then look. No review dispatch.

Build to **D3** exactly. The parts most likely to go wrong, in order:

1. **The CSS filter.** Radios must be visually hidden but focusable, never `display: none`. Verify by tabbing.
2. **Deriving the chips.** Map `domainsInUse()`, never a literal array.
3. **Row hover must not transform.** Background, stripe opacity, and title colour only.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { domainsInUse, projects } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const html = () =>
  readFileSync(fileURLToPath(new URL("../dist/work/index.html", import.meta.url)), "utf8");

describe("work index", () => {
  it("lists every project", () => {
    const doc = html();
    for (const project of projects) expect(doc).toContain(project.title);
  });

  it("offers a filter per domain in use, plus All", () => {
    const doc = html();
    const radios = doc.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(domainsInUse().length + 1);
  });

  it("keeps the radios focusable rather than display none", () => {
    expect(html()).not.toMatch(/type="radio"[^>]*style="[^"]*display:\s*none/);
  });

  it("tags every row with its domain so CSS can filter it", () => {
    const doc = html();
    const rows = doc.match(/data-domain="[a-z]+"/g) ?? [];
    expect(rows).toHaveLength(projects.length);
  });

  it("states the count from the data", () => {
    expect(html()).toContain(`${projects.length} projects`);
  });

  it("ships no literal em or en dash", () => {
    expect(/[\u2013\u2014]/.test(html())).toBe(false);
  });
});
```

- [ ] **Step 2:** Run `npm test -- work`, watch it fail on the missing file.
- [ ] **Step 3:** Build the row component and the page to D3.
- [ ] **Step 4:** `npm run build && npm test`.
- [ ] **Step 5:** **Look at it.** Serve `sites/main/dist` and open `/work`. Check: filters actually filter, keyboard tabbing reaches every chip, the register reads as a register and not a card grid, and nothing repeats a home page layout family.
- [ ] **Step 6:** Commit and push.

---

### Task 3: The detail page

**Files:** create `sites/main/src/pages/work/[id].astro`, `sites/main/src/components/ProjectMasthead.astro`, `sites/main/src/components/MetaRail.astro`; extend `sites/main/test/work.test.ts`.

**Visual task.** Implementer, then build, then look. No review dispatch.

Build to **D4** exactly.

The two hardest requirements:

1. **A project with no image must still look deliberate.** Four of the seven have no `media`. The fallback masthead is the hero's atmosphere with the domain accent substituted, not a grey box and not a stretched placeholder.
2. **Absent data omits its block entirely.** No empty headings, no empty rails.

- [ ] **Step 1: Add the failing assertions**

```ts
describe("project detail pages", () => {
  const page = (id: string) =>
    readFileSync(fileURLToPath(new URL(`../dist/work/${id}/index.html`, import.meta.url)), "utf8");

  it("generates a page for every project", () => {
    for (const project of projects) {
      expect(() => page(project.id)).not.toThrow();
    }
  });

  it("carries the project title as the only h1", () => {
    for (const project of projects) {
      const doc = page(project.id);
      expect((doc.match(/<h1\b/g) ?? [])).toHaveLength(1);
      expect(doc).toContain(project.title);
    }
  });

  it("uses exactly one eyebrow per page", () => {
    for (const project of projects) {
      const attrs = page(project.id).match(/class="[^"]*"/g) ?? [];
      const count = attrs.filter((a) =>
        a.slice(7, -1).split(/\s+/).some((t) => t === "eyebrow" || t.endsWith("__eyebrow")),
      ).length;
      expect(count).toBe(1);
    }
  });

  it("renders no empty metrics block when a project has none", () => {
    const bare = projects.find((p) => p.metrics.length === 0);
    if (bare) expect(page(bare.id)).not.toContain("metrics-rail");
  });

  it("gives every image alt text", () => {
    for (const project of projects) {
      for (const img of page(project.id).match(/<img\b[^>]*>/g) ?? []) {
        expect(img).toMatch(/\balt="[^"]/);
      }
    }
  });

  it("ships no literal em or en dash on any page", () => {
    for (const project of projects) {
      expect(/[\u2013\u2014]/.test(page(project.id))).toBe(false);
    }
  });
});
```

- [ ] **Step 2:** Run, watch it fail.
- [ ] **Step 3:** Build the masthead, the rail, and the route.
- [ ] **Step 4:** `npm run build && npm test`.
- [ ] **Step 5:** **Look at it.** Open at least three: `circuit-breakers` (image, award, metrics, links), `melanoma-cnn` (no image, no demo), and `library-system` (thinnest data of all). The third is the real test: if it looks broken, the fallbacks are wrong.
- [ ] **Step 6:** Commit and push.

---

### Task 4: Wire up and ship

**Files:** modify `sites/main/src/components/SelectedWork.astro`, `sites/main/src/components/WorldsGrid.astro`, `packages/ui/components/SiteNav.astro`.

- [ ] **Step 1:** Point the home page's `All work` link, the hero's `See the work`, and the Work world tile at `/work`. They already do; confirm each resolves rather than 404s.
- [ ] **Step 2:** Make `SiteNav`'s `Work` link mark itself current on both new routes.
- [ ] **Step 3:** Link each featured project on the home page to its detail page. Selected work currently links a project's primary external link; the card itself should now lead to `/work/[id]`, with the external link remaining as a secondary action.
- [ ] **Step 4:** `npm run build && npm test && npm run typecheck`.
- [ ] **Step 5:** Repo wide dash check.
- [ ] **Step 6:** Merge to `main`, tag `phase-2b`, push. The deploy runs automatically.
- [ ] **Step 7:** **Look at the live site.** Walk the whole path: home, click through to `/work`, filter, open a project, use prev and next, come back.

---

## Phase 2b Done When

- [ ] `/work` lists all projects and the filters work with JavaScript disabled
- [ ] Every chip is reachable by keyboard with a visible focus ring
- [ ] A detail page exists for every project, including those with no image
- [ ] No page has more than one `h1` or more than one eyebrow
- [ ] Every image has real alt text
- [ ] Nothing hardcodes a project count, a domain list, or the deploy path
- [ ] Neither new page reuses a home page layout family
- [ ] `npm test`, `npm run build`, and `npm run typecheck` all pass
- [ ] No literal em or en dash anywhere
- [ ] Merged, tagged `phase-2b`, and live

## Not In This Phase

`/art`, `/music`, and `/writing`, which are Phase 2c. Anything on the technical site, which is Phase 3. The audio re-encode, which is Phase 4. The generated backplates and the world tile image choices, which are a separate aesthetic pass and are tracked in the ledger.
