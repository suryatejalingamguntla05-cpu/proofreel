"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Briefs", href: "/dashboard/briefs", icon: "FileText" },
  { label: "Creators", href: "/dashboard/creators", icon: "Users" },
  { label: "Teams", href: "/dashboard/teams", icon: "Folder" },
  { label: "Messaging", href: "/dashboard/messages", icon: "MessageCircle" },
  { label: "Deliverables", href: "/dashboard/deliverables", icon: "Paperclip" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "Bell" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export function Sidebar({ active = "/dashboard", open = false, onClose: _onClose = undefined }: { active?: string; open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900",
      open ? "block" : "hidden md:flex"
    )}>
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <span className="text-lg font-bold tracking-tight">Proofreel</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const activeHref = item.href === "/dashboard" ? pathname === "/" ? "/dashboard" : "/" : item.href;
          const activePath = pathname === "/dashboard" || pathname === "/" ? "dashboard" : pathname;
          const isActive = activeHref === activePath || active === item.label;
          const icon = item.icon === "LayoutDashboard" ? "LayoutDashboard" : item.icon === "Users"
            ? "Users" : item.icon === "FileText" ? "FileText" : item.icon === "MessageCircle" ? "MessageCircle"
            : item.icon === "Paperclip" ? "Paperclip" : item.icon === "Bell" ? "Bell" : item.icon === "BarChart3" ? "BarChart3" : item.icon === "Settings" ? "Settings" : "LayoutDashboard";
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <span className={cn("w-5 h-5", { "text-violet-600": isActive, "text-gray-400": !isActive })}>{icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">Role: {active}</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
          {active === "admin" ? "Full access" : "View-only preview"}
        </p>
      </div>
    </aside>
  );
}
