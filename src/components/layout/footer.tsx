import Link from "next/link";
import { Github, Linkedin, ShieldCheck, Twitter } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "@/components/layout/brand-mark";

/**
 * Only routes that actually render are linked. The previous footer pointed
 * four labels at /creators, which made every click feel like a dead end.
 */
const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Discover creators", href: "/creators" },
      { label: "Creative briefs", href: "/briefs" },
      { label: "Brief builder", href: "/briefs/new" },
    ],
  },
  {
    title: "Evidence",
    links: [
      { label: "Why Proofreel", href: "/about" },
      { label: "How proof works", href: "/about#evidence" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create an account", href: "/register" },
      { label: "Log in", href: "/login" },
      { label: "Creator onboarding", href: "/onboarding" },
    ],
  },
];

const SOCIALS = [
  { label: "X", href: "https://x.com", Icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "GitHub", href: "https://github.com", Icon: Github },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandMark size={30} />
              <span className="font-display text-lg font-bold tracking-tight text-white">{BRAND.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              {BRAND.description}
            </p>
            <p className="chip-proof mt-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Every listing carries its evidence
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-ink-300 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.legalName} · {BRAND.domain}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="chip-meta">Demo catalogue · static data, no live database</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-400" /> No secrets in the client bundle
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
