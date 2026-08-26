import { z } from "zod";

/**
 * Em dash and en dash are banned in every user-visible string.
 * Both the stop-slop rules and the taste skill forbid them, so the ban is
 * enforced here rather than left to review.
 */
export const EM_DASH_MESSAGE =
  "Em dash and en dash are banned in site copy. Use a hyphen, comma, or period.";

const DASH_PATTERN = /[–—]/;

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
