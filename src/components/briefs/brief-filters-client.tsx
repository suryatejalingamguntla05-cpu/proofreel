"use client";

import { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PLATFORMS, CONTENT_TYPES } from "@/lib/constants";

const formSchema = z.object({
  status: z.string().optional(),
  content_type: z.string().optional(),
  platforms: z.string().optional(),
  style: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BriefFiltersClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: searchParams.get("status") ?? "",
      content_type: searchParams.get("content_type") ?? "",
      platforms: searchParams.get("platforms") ?? "",
      style: searchParams.get("style") ?? "",
    },
  });

  function onSubmit(data: FormValues) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(data)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Filters
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select {...register("status")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Content type</label>
              <select {...register("content_type")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">All types</option>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Platform</label>
              <select {...register("platforms")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">All platforms</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Style</label>
              <input {...register("style")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. minimal" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white">Apply</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
