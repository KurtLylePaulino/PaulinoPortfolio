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

/**
 * A title of pre-existing creative work: a track or a video.
 * Unlike `prose`, this permits em dashes and other punctuation, because the
 * artist chose the styling and rewriting it would alter the work itself.
 *
 * Use it ONLY for `trackSchema.title`, `trackSchema.vibe`, and
 * `videoSchema.title`. Never use it for descriptive copy such as `alt`,
 * `blurb`, `tagline`, or `summary`; those must stay on `prose`, which is what
 * enforces the em-dash ban across the site.
 */
export const properName = z.string().min(1, "A title cannot be empty");
