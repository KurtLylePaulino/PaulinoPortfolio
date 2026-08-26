// Migrates the previous site's bulk manifests (art.json, music.json) into the
// three generated data files this package validates at load time.
//
// Source manifests are read-only and live outside this repo. `writing.json`
// is hand-authored (no source manifest exists) and this script never touches it.
//
// Usage: node packages/content/scripts/migrate.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const SOURCE_DIR =
  "E:\\CLAUDE WORKSTATION\\PortFolio\\FullPortfolio\\assets\\data";
const ART_SOURCE = path.join(SOURCE_DIR, "art.json");
const MUSIC_SOURCE = path.join(SOURCE_DIR, "music.json");

const ART_LABELS = {
  artwork: "Concept artwork",
  vivi: "Vivi character study",
  yuria: "Yuria character study",
  maps: "Battle map",
  memes: "Meme",
};

/** Drops a leading "assets/" segment. Paths stay relative otherwise. */
function stripAssetsPrefix(p) {
  return p.replace(/^assets\//, "");
}

/**
 * Id from a filename stem: lowercased, any character outside [a-z0-9-]
 * replaced by a hyphen, repeated hyphens collapsed, and leading/trailing
 * hyphens trimmed.
 */
function idFromFilename(filePath) {
  const stem = path.basename(filePath, path.extname(filePath));
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Writes JSON with em/en dashes escaped so no literal dash byte lands on disk. */
function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  const escaped = json.replace(/\u2014/g, "\\u2014").replace(/\u2013/g, "\\u2013");
  writeFileSync(filePath, escaped + "\n", "utf8");
}

function assertUniqueIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate id "${item.id}" while building ${label}`);
    }
    seen.add(item.id);
  }
}

function buildArtAndVideo() {
  const raw = JSON.parse(readFileSync(ART_SOURCE, "utf8"));
  const artworks = [];
  const videos = [];

  for (const [key, collection] of Object.entries(raw)) {
    if (collection.type === "video") {
      collection.items.forEach((item) => {
        videos.push({
          id: idFromFilename(item.video),
          title: item.title,
          src: stripAssetsPrefix(item.video),
        });
      });
      continue;
    }

    const label = ART_LABELS[key];
    if (!label) {
      throw new Error(`No ART_LABELS entry for collection "${key}"`);
    }
    const total = collection.items.length;
    collection.items.forEach((item, index) => {
      artworks.push({
        id: idFromFilename(item.full),
        collection: key,
        src: stripAssetsPrefix(item.full),
        thumb: stripAssetsPrefix(item.thumb),
        alt: `${label}, image ${index + 1} of ${total}`,
        width: item.w,
        height: item.h,
      });
    });
  }

  assertUniqueIds(videos, "videos");
  for (const key of Object.keys(ART_LABELS)) {
    assertUniqueIds(
      artworks.filter((a) => a.collection === key),
      `artworks/${key}`,
    );
  }

  return { artworks, videos };
}

function buildTracks() {
  const raw = JSON.parse(readFileSync(MUSIC_SOURCE, "utf8"));
  const tracks = [];

  for (const category of raw.categories) {
    if (category.key === "personal") continue; // curated picks row, duplicates other tracks

    for (const track of category.tracks) {
      tracks.push({
        id: idFromFilename(track.src),
        title: track.title,
        collection: category.key,
        src: stripAssetsPrefix(track.src),
        vibe: track.vibe,
      });
    }
  }

  assertUniqueIds(tracks, "tracks");
  return tracks;
}

function main() {
  const { artworks, videos } = buildArtAndVideo();
  const tracks = buildTracks();

  writeJson(path.join(DATA_DIR, "art.json"), artworks);
  writeJson(path.join(DATA_DIR, "video.json"), videos);
  writeJson(path.join(DATA_DIR, "music.json"), tracks);

  console.log("Migration complete:");
  console.log(`  art.json    ${artworks.length} artworks`);
  console.log(`  video.json  ${videos.length} videos`);
  console.log(`  music.json  ${tracks.length} tracks`);
  console.log("  (writing.json is hand-authored and was not touched)");
}

main();
