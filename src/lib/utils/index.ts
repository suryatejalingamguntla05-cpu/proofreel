import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cnJoin(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with thousands separators (e.g. 1,234,567) */
export function formatNumber(value: number, maxFractionDigits = 2): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/** Format a USD/INR amount in minor units (paise/anrs) into a string */
export function formatMinorUnits(valueInMinorUnits: number, currency = "INR"): string {
  const amount = valueInMinorUnits / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date string to a readable date */
export function formatDate(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a relative/date-time string with time */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Truncate text to a fixed display length */
export function truncate(text: string, maxChars = 80): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "…";
}

/** Generate a consistent slug from a display name */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return clsx(...classes.filter(Boolean));
}
