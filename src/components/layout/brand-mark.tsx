import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The Proofreel mark: an iris-to-mint squircle holding a play glyph, with a
 * mint verification dot. The dot is the point of the brand — it is the same
 * mint used for every proof chip in the product, so the logo states the thesis:
 * everything you watch here carries evidence.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${BRAND.name} mark`}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="proofreel-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6a5cf3" />
          <stop offset="55%" stopColor="#5a41e4" />
          <stop offset="100%" stopColor="#12b077" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9.5" fill="url(#proofreel-mark)" />
      <path d="M12.5 10.2 L21.4 16 L12.5 21.8 Z" fill="#ffffff" />
      <circle cx="24.5" cy="24.5" r="4" fill="#0c0e16" />
      <circle cx="24.5" cy="24.5" r="2.6" fill="#2bcc8f" />
    </svg>
  );
}

/** Mark plus wordmark. `tone="invert"` for use on light marketing surfaces. */
export function BrandLockup({
  size = 32,
  className,
  wordClassName,
  tone = "default",
}: {
  size?: number;
  className?: string;
  wordClassName?: string;
  tone?: "default" | "invert";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          tone === "invert" ? "text-ink-950" : "text-white",
          wordClassName
        )}
      >
        {BRAND.name}
      </span>
    </span>
  );
}
