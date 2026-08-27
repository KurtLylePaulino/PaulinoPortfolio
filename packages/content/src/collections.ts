import artData from "../data/art.json" with { type: "json" };
import musicData from "../data/music.json" with { type: "json" };
import videoData from "../data/video.json" with { type: "json" };
import writingData from "../data/writing.json" with { type: "json" };
import {
  artworkSchema, trackSchema, videoSchema, writingSchema,
  type Artwork, type Track, type Video, type Writing,
} from "./schema.js";

/** Parsed at module load, so malformed data fails the build rather than a page. */
export const artworks: Artwork[] = artData.map((a) => artworkSchema.parse(a));
export const videos: Video[] = videoData.map((v) => videoSchema.parse(v));
export const tracks: Track[] = musicData.map((t) => trackSchema.parse(t));
export const writings: Writing[] = writingData.map((w) => writingSchema.parse(w));

export function artByCollection(name: Artwork["collection"]): Artwork[] {
  return artworks.filter((a) => a.collection === name);
}

export function tracksByCollection(name: Track["collection"]): Track[] {
  return tracks.filter((t) => t.collection === name);
}
