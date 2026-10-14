/**
 * src/components/layout/dashboard-shell.tsx
 * ---------------------------------------------------------------------------
 * Shared layout for all authenticated pages (creator + brand dashboards).
 *
 * Contains the top app bar, horizontal sidebar, and main content area.
 * The component itself is server-rendered; user-specific navigation items
 * are injected via `navItems` so we never create dead buttons.
 */

import { ReactNode } from "react";

export function DashboardShell({
  user,
  navItems,
  children,
  title,
}: {
  user: { role: string; profile: { display_name: string; username: string; avatar_url: string | null } | null };
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  children: ReactNode;
  title: string;
}) {
  void user.role;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      {/* Top app bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/80">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">Proofreel</span>
          <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:inline">{title}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {user.profile?.avatar_url && (
            <img
              src={user.profile.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium hidden sm:inline">{user.profile?.display_name ?? user.profile?.username ?? "you"}</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 flex-shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-neutral-900 md:block">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium capitalize">{user.role}</p>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShellMobile({
  user: _user,
  navItems: _navItems,
  children,
  title,
}: {
  user: { role: string; profile: { display_name: string; username: string; avatar_url: string | null } | null } | null;
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/80">
        <span className="text-lg font-bold tracking-tight">Proofreel</span>
        <span className="ml-auto text-sm font-medium">{title}</span>
      </header>
      <main className="p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
