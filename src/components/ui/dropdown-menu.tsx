"use client";

import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export { DropdownMenuRoot as DropdownMenu };

export function DropdownMenuRoot(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function DropdownMenuTrigger(props: React.ComponentProps<"button">) {
  return <button {...props} />;
}

export function DropdownMenuGroup(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function DropdownMenuItem(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700",
        props.className
      )}
    >
      {props.children}
    </button>
  );
}

export function DropdownMenuSeparator(props: React.ComponentProps<"div">) {
  return <div className="pointer-events-none my-1 h-px bg-gray-200 dark:bg-gray-700" {...props} />;
}

export function DropdownMenuSub(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function DropdownMenuSubTrigger(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100",
        props.className
      )}
    >
      {props.children}
      <ChevronRight className="w-4 h-4 opacity-50" />
    </button>
  );
}

export function DropdownMenuSubContent(props: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800",
        props.className
      )}
      {...props}
    />
  );
}

export function DropdownMenuContent(props: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-2 w-56 max-h-80 overflow-auto rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800",
        props.className
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem(props: React.ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
        props.className
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300">
        {props.children ? (
          <Check className="w-3 h-3 text-violet-600" />
        ) : (
          <Circle className="w-3 h-3 text-gray-400" />
        )}
      </span>
      {props.children}
    </label>
  );
}

export function DropdownMenuRadioGroup(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export function DropdownMenuRadioItem(props: React.ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
        props.className
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300">
        {props.children ? (
          <Check className="w-3 h-3 text-violet-600" />
        ) : (
          <Circle className="w-3 h-3 text-gray-400" />
        )}
      </span>
      {props.children}
    </label>
  );
}
