# Portfolio Rebuild: Design Spec

**Date:** 2026-08-26
**Owner:** Kurt Lyle Paulino
**Status:** Approved for planning

---

## 1. What we are building

Two static sites, rebuilt from zero in one monorepo, replacing the existing `FullPortfolio`
and `TechnicalPortfolio` repos.

| Site | Role | Audience |
|---|---|---|
| **Main** | The link Kurt gives out. Carries the hiring burden and shows the full range. | Recruiters, hiring managers, anyone who asks for his portfolio |
| **Technical** | The engineering annex, handed over on request. | Technical interviewers, engineers reviewing depth |

The main site is primary. The technical site exists to answer "show me the engineering" in
more depth than a hiring manager needs.

## 2. Positioning

Kurt is a **developer first**. He is a Computer Science graduate of De La Salle Lipa
(game development track) with an award-winning Unity thesis, a melanoma classifier, shipped
web apps, and a Python tooling project. He also makes music, generates visual art, and writes
a dark-fantasy world called Canrael.

Three rules follow from this:

1. **A visitor learns he is a developer before anything else.** The current hub asks people to
   pick a "world" before seeing any work, so a recruiter who leaves after 40 seconds may never
   find out he engineers.
2. **Machine learning, games, and web carry equal weight.** He has real work in all three. The
   site never ranks them. Games do not lead just because the thesis is a game.
3. **The creative work is range, not decoration, and not the headline.** It gets full pages and
   real depth, positioned after the proof that he engineers.

## 3. Architecture

### 3.1 Repo shape

```
PORTOFOLIO UPGRADE/
├─ package.json                  npm workspaces root
├─ packages/
│  ├─ content/                   single source of truth
│  │  ├─ schema.ts               Zod schemas
│  │  └─ data/                   projects.ts, art.ts, music.ts, writing.ts
│  └─ ui/                        shared design system
│     ├─ tokens.css              colors, type, spacing, radii
│     └─ components/             primitives shared by both sites
├─ sites/
│  ├─ main/                      Astro site  → primary link
│  └─ technical/                 Astro site  → engineering annex
├─ media/                        source media + optimization scripts
└─ docs/superpowers/specs/       this document
```

### 3.2 Why a monorepo

The current setup has `TechnicalPortfolio` fetch `projects.json` over the network from
`FullPortfolio` at runtime. If the main site moves or renames a path, the technical site
silently shows nothing.

Both sites import from `packages/content` at **build time** instead. A project is edited once.
Both sites rebuild with it. Neither can break because the other moved. Design tokens work the
same way: one file, two consumers.

### 3.3 Stack

- **Astro 5** with static output. Ships HTML with near-zero JavaScript.
- **npm workspaces.** No pnpm or turborepo, which would add ceremony this does not need.
- **TypeScript** for content schemas so a malformed project fails the build instead of the page.
- **No CSS framework.** The design system is small and specific. Tailwind would add a
  build dependency to save very little.
- **Astro's `<Image>`** for responsive `srcset` generation across 175 images.

### 3.4 Content model

`packages/content/schema.ts` defines Zod schemas. Every site imports typed data.

```ts
Project  { id, title, domain: 'ml'|'game'|'web'|'tool', year, featured,
           award?, tagline, blurb, summary, stack[], highlights[],
           metrics[{label,value}], media?, demo?, links[{label,href,kind}] }
Artwork  { id, collection, src, thumb, alt, width, height }
Track    { id, title, collection: 'original'|'dnd'|'ruina', src, duration }
Writing  { id, title, kind, blurb, pdf, year }
```

`domain` replaces the current `category` field and is used as a **filter tag**, never as a
section heading. See 4.2.

### 3.5 Adding projects later

Kurt expects to add projects after launch. Adding one must never require touching layout code,
so the build treats the project list as data from the start:

1. Append an entry to `packages/content/data/projects.ts`. The Zod schema validates it at build
   time, and a malformed entry fails the build instead of shipping a broken card.
2. Drop its image in `media/`. The image pipeline picks it up.
3. Optionally add a case study for the technical site. A project without one simply does not get
   a case study page, and nothing else breaks.

Rules that keep this true, and that implementation must not violate:

- **No count is hardcoded.** No `slice(0, 7)`, no fixed grid template of seven cells, no copy
  that says "seven projects". Grids derive their cell count from the data length.
- **No layout branches on a specific project id.** Featured versus standard is the only
  distinction, driven by the `featured` flag.
- **Domain filter chips derive from the data**, so a new `domain` value produces a new chip
  without a code change.
- **Every optional field degrades gracefully.** A project with no `award`, `demo`, `media`, or
  `metrics` renders correctly with those elements absent, not with empty containers.

We ship with the current 7 projects. The older React and React Native coursework repos are
deliberately out of scope for this build and get reviewed after launch.

## 4. Main site

### 4.1 Page structure

| Order | Section | Job |
|---|---|---|
| 1 | Hero | Name, role, and one line of checkable proof |
| 2 | Selected work | The 3 featured projects, in full cards. First thing below the fold. Ends with one link to the full index. |
| 3 | Credentials | Degree, 3× thesis awards, stack. Compact and factual. |
| 4 | The four worlds | Work · Art · Music · Writing, equal weight, each linking to its own page |
| 5 | About + contact | Résumé, GitHub, LinkedIn, email |

Routes: `/`, `/work`, `/work/[id]`, `/art`, `/music`, `/writing`.

**Selected work versus the work index.** These are two different things and must not be
confused during implementation. The home page shows only the 3 projects flagged `featured`
(Circuit Breakers, Fightmap Generator, Canrael Codex). The complete index of all 7 lives at
`/work`, which is also what the "Work" world in section 4 links to. The home page never renders
the full list.

### 4.2 The work index at `/work`

**One index, no domain sections.** Domain is a filter chip (`All · ML · Games · Web · Tools`),
not a heading. This matters: splitting into three domain sections would produce columns of
1, 2, and 4 items and read as lopsided no matter how it is styled. Filtering treats the three
domains equally by refusing to rank them structurally.

Card size is driven by `featured`, not by domain. Featured projects get a wide cell with media;
the rest get standard cells. The grid has exactly as many cells as there are projects.

### 4.3 The four worlds

Presented with equal visual weight, after the work index has established that Kurt engineers.

- **Work**: the full project index
- **Art**: 5 collections, 175 images, lightbox
- **Music**: 40 tracks, 3 playlists, one player
- **Writing**: Canrael. 10 documents, world summary, timeline

Label the fourth world **"Writing"** or **"Writing & Worldbuilding"**. Never "Canrael" as the
label. Canrael is the subject of the page, and a stranger should not have to decode a proper
noun to know what the section holds.

## 5. Technical site

The current technical site renders roughly the same cards the main site does, in a darker skin.
That does not justify a second site. It must hold things the main site does not:

- **Case studies, not cards.** Problem, architecture, decisions and their tradeoffs, what broke,
  what he would change. One page per significant project.
- **Live demos embedded and lazy-loaded.** Canrael Codex, Haiku Daily, Jianghu Proverbs.
- **Real artifacts.** The thesis manuscript, the melanoma notebook, code excerpts.
- **Higher density.** More metadata, more monospace, tighter spacing than the main site.

Routes: `/`, `/case/[id]`, `/stack`.

Same content source, same tokens, genuinely different depth.

## 6. Design system: "Archive"

Warm near-black and brass. The site reads like a kept archive box: lamplight, gilt lettering,
aged paper. It lets the engineering work and the fantasy writing share a surface without either
one dressing up as the other.

### 6.1 Color

All values verified against WCAG AA for body text on the ground.

| Token | Hex | Contrast on ground | Use |
|---|---|---|---|
| `--ground` | `#0c0b09` | n/a | Page background |
| `--raised` | `#151310` | n/a | Cards, elevated surfaces |
| `--line` | `#282420` | n/a | Hairlines, borders |
| `--ink` | `#efe9df` | 16.29 | Primary text, headings |
| `--ink-mid` | `#a09689` | 6.76 | Body text, descriptions |
| `--ink-low` | `#827868` | 4.53 | Metadata, captions, years |
| `--accent` | `#c4913c` | 6.99 | Brass. Links, awards, focus rings |

**World accents.** Each world page carries one secondary hue inside the same system, like
colored tabs in an archive. The hub itself stays on brass alone so nothing competes above
the fold.

| World | Hex | Contrast |
|---|---|---|
| Work | `#c4913c` brass | 6.99 |
| Art | `#7c9c8b` verdigris | 6.54 |
| Music | `#c4634c` terracotta | 4.91 |
| Writing | `#cdbfa3` parchment | 10.85 |

One accent per page. No page uses two.

### 6.2 Type

| Role | Face | Notes |
|---|---|---|
| Display | **Archivo** 700 | `letter-spacing: -0.035em`, `line-height: 1.03` |
| Body | **Archivo** 400 | `max-width: 65ch`, `line-height: 1.6` |
| Data | **JetBrains Mono** 400 | Years, metrics, counts, stack chips |

Self-hosted via `@fontsource`. No `<link>` to Google Fonts in production.

Explicitly rejected: **Inter** (the converging default), **Instrument Sans**, **Geist**,
**Space Grotesk** (all flagged as overused), and **serif display of any kind**. Serif would push
the read toward "writer who codes" when the roles are development roles.

### 6.3 Rules

- Radius: one scale. `2px` on chips and inputs, `3px` on cards. Nothing pill-shaped.
- Shadows: none. Elevation comes from `--raised` and hairlines.
- Motion: scroll reveals and hover states only. Everything behind `prefers-reduced-motion`.
- No glassmorphism, no gradients, no glows.
- Dark only. This is a deliberate single-theme commitment, not an omission. Every color is
  painted explicitly.

## 7. Copy

Every visible string passes stop-slop. Enforced rules:

- **Zero em dashes.** Both stop-slop and the taste skill ban them independently. Use a period,
  a comma, or a hyphen.
- No filler openers or closers ("Have a look around", "Here's what").
- No "I'm an X and a Y" binary setups.
- Active voice with a human subject.
- Specific and checkable over evocative. "90% accuracy" beats "high accuracy".
- No stock phrases ("seven years in the making", "passionate about").
- Vary sentence length. Do not end every paragraph on a punchy one-liner.

### 7.1 Worked example

**Before:**
> I'm a developer and a creative. I build games and machine-learning systems, and the rest of my
> time goes to making music and writing Canrael, a dark-fantasy world seven years in the making.
> Have a look around.

**After:**
> Eyebrow: `Developer`
> H1: **I build models, tools, and games.**
> Subtext: Computer Science, De La Salle Lipa. A melanoma classifier at 90% accuracy, an award
> winning Unity thesis, and web apps you can open here.

Hero limits from the taste skill: headline at most 2 lines, subtext at most 20 words and 4 lines,
at most 4 text elements total, no trust strip or tagline inside the hero.

The same pass applies to all 7 project blurbs, the 4 world descriptions, the about section, and
every button label. No two CTAs share an intent.

## 8. Assets

309 MB of source media does not ship as-is.

| Asset | Current | Plan |
|---|---|---|
| Audio | **239 MB**, 40 tracks | Re-encode to 128 kbps VBR (~90 MB). Lazy-load: nothing downloads until play is pressed. |
| Images | 28 MB WebP, 175 files | Already optimized. Astro generates responsive `srcset`. |
| Video | 23 MB, 6 files | Poster frames, load on interaction. |
| Docs | 20 MB PDFs | Keep. Compress the 14 MB `paradigms-reach-setup.pdf`. |

Music at 320 kbps buys nothing a visitor hears through laptop speakers. 128 kbps VBR cuts the
weight by roughly 60% and keeps the repo comfortable for git.

**Dependency:** ffmpeg is not installed. Setup step: `winget install Gyan.FFmpeg`.

Re-encoding is scripted in `media/` so it can be rerun when tracks are added.

## 9. Version control, backup, and deployment

### 9.1 Repository

**`github.com/KurtLylePaulino/PaulinoPortfolio`**, public.

One repo holds the monorepo and deploys both sites through a single GitHub Pages target:

| Site | URL |
|---|---|
| Main | `https://kurtlylepaulino.github.io/PaulinoPortfolio/` |
| Technical | `https://kurtlylepaulino.github.io/PaulinoPortfolio/technical/` |

A single Pages deployment avoids cross-repo pushes, which would otherwise need a personal
access token because the default `GITHUB_TOKEN` cannot write to another repository.

Astro's `base` is set per site so asset paths resolve under the subpath.

### 9.2 Branch model

`main` holds only work that passes its phase criteria. Active work happens on a phase branch.

```
main
├─ phase/1-foundation
├─ phase/2-main-site
├─ phase/3-technical-site
└─ phase/4-assets-deploy
```

- Commit and push to the phase branch after each meaningful unit of work, not in one batch at
  the end. This is the backup and archival mechanism Kurt asked for: progress survives a machine
  failure and the history stays readable.
- Merge a phase branch into `main` only when every item in its "done when" column passes.
- Tag each merge (`phase-1`, `phase-2`, `phase-3`, `phase-4`) so any phase state can be recovered.
- **Never force-push, never rewrite published history.** The archive is the point.

### 9.3 Existing repos

`FullPortfolio` and `TechnicalPortfolio` stay live and untouched until the rebuild is verified.
Nothing is deleted or migrated as part of this work. Retiring them is a separate decision Kurt
makes after seeing the result.

### 9.4 Project source links

Five of the seven projects have their own public repos. Each project's `links` array points at
its real repository rather than at the profile root, so a reviewer can go from a card straight
to the code.

| Project | Repo |
|---|---|
| Fightmap Generator | `MapGenConcept` |
| The Canrael Codex | `canrael-codex` |
| Haiku Daily | `HaikuDaily` |
| Jianghu Proverbs | `jianghu-proverbs` |
| Library Management System | `Finals-Project-Webdev-LIBRARYMANAGEMENT` |

Circuit Breakers and the melanoma CNN have no public repo. They link to the thesis manuscript
and the notebook instead, and no fake repo link is invented for them.

## 10. Build order

This is one project, but it is too large for a single undivided pass. The implementation plan
breaks into four phases, each independently verifiable.

| Phase | Delivers | Done when |
|---|---|---|
| 1. Foundation | Monorepo, workspaces, `packages/content` with all 7 projects migrated and typed, `packages/ui` tokens | `npm run build` succeeds in both site shells, schema rejects malformed data |
| 2. Main site | All 6 routes, the four worlds, art gallery, music player, writing index | Every route renders with real content, Lighthouse targets met |
| 3. Technical site | Case study template, 3 embedded demos, stack page | Case studies render, demos load lazily |
| 4. Assets and deploy | ffmpeg re-encode pipeline, image pipeline, GitHub Actions for both sites | Both sites live on Pages, first-visit payload under 1 MB |

Phase 1 gates everything. Phases 2 and 3 can proceed in either order once it lands.

## 11. Success criteria

1. A recruiter learns Kurt is a developer within one screen, without clicking.
2. Machine learning, games, and web read as equally weighted in the work index.
3. Editing a project once updates both sites. No runtime cross-site fetch anywhere.
4. Lighthouse: performance ≥ 95, accessibility 100 on the main site's home and work pages.
5. Every palette pair used for text passes WCAG AA.
6. Zero em dashes in any shipped string.
7. Total transferred bytes for a first visit to the home page stay under 1 MB.

## 12. Out of scope

- Any CMS or admin interface. Content is edited as TypeScript files.
- A blog or any dated content stream.
- Server-side anything. Both sites stay static.
- Rewriting the three existing live demos. They get embedded as-is.
- Migrating or deleting the old repos.

## 13. Open risks

| Risk | Mitigation |
|---|---|
| 90 MB of audio still makes for a heavy git repo | Lazy loading means visitors never pay for it. Revisit external hosting if the repo becomes unwieldy. |
| Astro's image pipeline over 175 files may slow builds | Measure. Precomputed thumbs already exist and can be used directly if needed. |
| Two sites means two sets of copy to keep in sync | Shared content package holds the canonical blurbs. Site-specific copy is deliberately short. |
