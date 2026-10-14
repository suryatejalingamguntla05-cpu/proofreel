import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { DashboardLogoutButton } from "../../components/layout/dashboard-logout-button";
import { getDemoSessionFromServer } from "@/lib/demo/session";

type NavItem = { href: string; label: string; icon: LucideIcon };

function navFor(role: string): NavItem[] {
  if (role === "brand") {
    return [
      { href: "/brand", label: "Workspace", icon: LayoutDashboard },
      { href: "/briefs", label: "Briefs", icon: FileText },
      { href: "/creators", label: "Find creators", icon: Users },
      { href: "/briefs/new", label: "Create a brief", icon: FileText },
    ];
  }
  return [
    { href: "/creator", label: "Workspace", icon: LayoutDashboard },
    { href: "/briefs", label: "Find briefs", icon: FileText },
    { href: "/creators", label: "Explore creators", icon: Users },
  ];
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getDemoSessionFromServer();

  if (!session) {
    redirect("/login");
  }

  const role = session.role === "brand" ? "brand" : "creator";
  const userLabel = session.displayName || session.username || "You";
  const nav = navFor(role);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900 md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-5 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600 text-sm text-white">CP</span>
            <span className="text-violet-700 dark:text-violet-300">Proofreel</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Dashboard">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <p className="truncate px-1 text-sm font-medium text-gray-800 dark:text-gray-200">{userLabel}</p>
          <p className="px-1 text-xs capitalize text-gray-400">{role}</p>
          <DashboardLogoutButton className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800">
            <LogOut className="h-4 w-4" /> Sign out
          </DashboardLogoutButton>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden dark:border-gray-800 dark:bg-neutral-900">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-600 text-xs text-white">CP</span>
            Proofreel
          </Link>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
            {role}
          </span>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden dark:border-gray-800 dark:bg-neutral-900">
          {nav.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-400 md:px-6 dark:border-gray-800">
          Proofreel · demo workspace · brand and creator flows enabled
        </footer>
      </div>
    </div>
  );
}
