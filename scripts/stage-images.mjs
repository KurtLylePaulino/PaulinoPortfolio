// Stages the binary image assets that packages/content references.
//
// packages/content (art.json, projects.ts) is the single source of truth for
// which images exist. This script derives its work list from that package,
// not from walking the source directory: for every artwork it copies `src`
// and `thumb`, and for every project with a `media` value it copies that
// file. A directory walk would silently include files the data never
// references and silently succeed even when a file the data DOES reference
// is missing. Deriving from the data means a missing source file is a loud,
// immediate failure here, which is the cheapest place to catch it.
//
// Source is read-only: never write to it, never delete from it.
// Override with PORTFOLIO_SOURCE_DIR; defaults to the sibling checkout of
// the previous, still-live portfolio site.
//
// Usage: node scripts/stage-images.mjs

import { existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");

const SOURCE_ROOT =
  process.env.PORTFOLIO_SOURCE_DIR ??
  "E:\\CLAUDE WORKSTATION\\PortFolio\\FullPortfolio\\assets";
const MEDIA_ROOT = path.join(REPO_ROOT, "media");

const CONTENT_DIR = path.join(REPO_ROOT, "packages", "content");
const CONTENT_ENTRY = path.join(CONTENT_DIR, "dist", "src", "index.js");

/**
 * packages/content is TypeScript resolved by Vite/vitest at build and test
 * time (its package.json "exports" points straight at src/index.ts). Plain
 * node cannot follow that: the source uses TS's "./schema.js"-referring-to-
 * "./schema.ts" convention, which only bundler-style resolvers understand.
 * So this script builds the package's compiled output with the project's
 * own tsc (already a devDependency, already wired for this via project
 * references) and imports that instead. No new tooling, no data rewriting.
 */
function buildContentPackage() {
  const tscEntry = path.join(REPO_ROOT, "node_modules", "typescript", "bin", "tsc");
  execFileSync(process.execPath, [tscEntry, "-b", CONTENT_DIR], {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
}

async function loadContent() {
  buildContentPackage();
  if (!existsSync(CONTENT_ENTRY)) {
    throw new Error(`Expected build output at ${CONTENT_ENTRY} but it is missing.`);
  }
  return import(pathToFileURL(CONTENT_ENTRY).href);
}

/**
 * Every asset in the source tree lives under assets/img/. art.json's src and
 * thumb paths already carry that prefix (e.g. "img/art/artwork/artwork-01
 * .webp"), copied verbatim from the source layout by the migration script.
 * Project `media` values were hand-authored without it (e.g.
 * "projects/circuit-breakers.webp"). Normalizing here, rather than editing
 * that data, resolves both against where the bytes actually live without
 * touching the content package.
 */
function sourceRelativePath(declaredPath) {
  return declaredPath.startsWith("img/") ? declaredPath : `img/${declaredPath}`;
}

/** Builds the { declaredPath, sourceAbs, destAbs } work list from the content package. */
function buildWorkList({ artworks, projects }) {
  const byDestAbs = new Map();

  const add = (declaredPath) => {
    const destAbs = path.join(MEDIA_ROOT, declaredPath);
    if (byDestAbs.has(destAbs)) return;
    byDestAbs.set(destAbs, {
      declaredPath,
      sourceAbs: path.join(SOURCE_ROOT, sourceRelativePath(declaredPath)),
      destAbs,
    });
  };

  for (const artwork of artworks) {
    add(artwork.src);
    add(artwork.thumb);
  }
  for (const project of projects) {
    if (typeof project.media === "string") add(project.media);
  }

  return [...byDestAbs.values()];
}

function stage(workList) {
  const missing = workList.filter((entry) => !existsSync(entry.sourceAbs));
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} source file(s) referenced by packages/content:`);
    for (const entry of missing) {
      console.error(`  ${entry.declaredPath}  (looked for ${entry.sourceAbs})`);
    }
    process.exit(1);
  }

  let copied = 0;
  let alreadyPresent = 0;
  let bytesCopied = 0;

  for (const entry of workList) {
    if (existsSync(entry.destAbs)) {
      alreadyPresent += 1;
      continue;
    }
    mkdirSync(path.dirname(entry.destAbs), { recursive: true });
    copyFileSync(entry.sourceAbs, entry.destAbs);
    bytesCopied += statSync(entry.destAbs).size;
    copied += 1;
  }

  console.log(`Staged ${workList.length} referenced file(s) into ${MEDIA_ROOT}`);
  console.log(`  copied:          ${copied}`);
  console.log(`  already present: ${alreadyPresent}`);
  console.log(`  bytes copied:    ${bytesCopied}`);
}

const content = await loadContent();
const workList = buildWorkList(content);
stage(workList);
