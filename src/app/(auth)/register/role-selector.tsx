"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const roles: { value: Role; label: string; desc: string; icon: string }[] = [
  {
    value: "creator",
    label: "Creator",
    desc: "AI filmmaker, animator, designer, or generative artist",
    icon: "🎬",
  },
  {
    value: "brand",
    label: "Brand / Agency",
    desc: "Businesses searching for AI content",
    icon: "🏢",
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">{roles.find((r) => r.value === value)?.icon}</span>
          <span>{roles.find((r) => r.value === value)?.label}</span>
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-neutral-800">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left text-sm",
                value === r.value ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              )}
              onClick={() => {
                onChange(r.value);
                setOpen(false);
              }}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="flex-1">{r.label}</span>
              {value === r.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
