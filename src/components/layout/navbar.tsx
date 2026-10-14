"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Briefcase, Compass, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, PRIMARY_NAV } from "@/lib/brand";
import { BrandLockup } from "@/components/layout/brand-mark";
import { clearDemoSession } from "@/lib/demo/session";

type NavUser = {
  display_name: string;
  username: string;
  role: string;
  avatar_url: string | null;
};

/** Icon per public route, so the nav config in brand.ts stays display-free. */
const PUBLIC_ICONS: Record<string, typeof Compass> = {
  "/creators": Compass,
  "/briefs": Briefcase,
  "/about": ShieldCheck,
};

const PRIVATE_ITEMS = (role: string) => [
  { href: role === "brand" ? "/brand" : "/creator", label: "Workspace", icon: LayoutDashboard },
];

function Avatar({ user, size = 30 }: { user: NavUser; size?: number }) {
  if (user.avatar_url) {
    // Demo avatars are remote; plain <img> keeps next/image config free
    // (documented in SECURITY.md).
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatar_url} alt="" width={size} height={size} className="rounded-full object-cover" />;
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-brand-600/30 text-xs font-bold text-brand-200 ring-1 ring-brand-400/40"
      aria-hidden="true"
    >
      {user.display_name.charAt(0).toUpperCase()}
    </span>
  );
}

export function Navbar({ user, isAuthed }: { user: NavUser | null; isAuthed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const publicItems = PRIMARY_NAV.map((item) => ({ ...item, icon: PUBLIC_ICONS[item.href] ?? Compass }));
  const items = [...publicItems, ...(isAuthed && user ? PRIVATE_ITEMS(user.role) : [])];

  async function logout() {
    setLoggingOut(true);
    clearDemoSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-7">
          <Link href="/" aria-label={`${BRAND.name} home`} className="rounded-lg">
            <BrandLockup />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-600/20 text-brand-100 ring-1 ring-inset ring-brand-400/30"
                      : "text-ink-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed && user ? (
            <>
              <Link
                href={user.role === "brand" ? "/brand" : "/creator"}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 hover:bg-white/10"
              >
                <Avatar user={user} />
                <span className="text-sm font-medium text-ink-100">{user.display_name}</span>
                <span className="rounded bg-brand-600/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-200">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={() => void logout()}
                disabled={loggingOut}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-ink-400 transition-colors hover:text-white disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" /> {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-200 hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink-950 px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-200 hover:bg-white/5"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-white/10 pt-3">
            {isAuthed && user ? (
              <button
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" /> Sign out ({user.display_name})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex-1"
                >
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Start free
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
