"use client";

import { CheckCircle, Clock, FileText, Award, Sparkles, RotateCcw, CircleDashed } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PassportSignal = {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "gray";
};

type Tone = "green" | "amber" | "gray";

const TONE_STYLES: Record<Tone, { badge: string; icon: ReactNode }> = {
  green: {
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  amber: {
    badge: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300",
    icon: <Clock className="h-4 w-4" />,
  },
  gray: {
    badge: "bg-gray-50 border-gray-200 text-gray-500 dark:bg-neutral-800 dark:border-gray-700 dark:text-gray-400",
    icon: <CircleDashed className="h-4 w-4" />,
  },
};

export function ProofPassport({ signals, score }: { signals: PassportSignal[]; score?: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-lg">🛡️</span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Creator Proof Passport</h2>
        {score !== undefined && (
          <span className="ml-auto rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {score}/100
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {signals.map((signal) => (
          <SignalRow key={signal.label} signal={signal} />
        ))}
      </div>
      <p className="mt-4 border-t border-gray-200 pt-3 text-[11px] text-gray-400 dark:border-gray-800">
        Each proof signal is evaluated independently. “Self-reported” or “pending” means the claim has NOT been
        reviewed by platform admins — the platform deliberately avoids a single global “verified” badge.
      </p>
    </div>
  );
}

function SignalRow({ signal }: { signal: PassportSignal }) {
  const tone = TONE_STYLES[signal.tone];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", tone.badge)}>
        {tone.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{signal.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{signal.value}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{signal.detail}</p>
      </div>
    </div>
  );
}

/** Prebuilt signal rows for common passport states. */
export const PassportSignals = {
  profileComplete(): PassportSignal {
    return { label: "Profile completeness", value: "Strong", detail: "Bio, location, and languages documented", tone: "green" };
  },
  profilePartial(): PassportSignal {
    return { label: "Profile completeness", value: "Partial", detail: "Some profile fields are missing", tone: "amber" };
  },
  portfolio(count: number): PassportSignal {
    return {
      label: "Portfolio completeness",
      value: `${count} public item${count === 1 ? "" : "s"}`,
      detail: count > 3 ? "Healthy public portfolio" : count >= 1 ? "Consider adding more work" : "No public items yet",
      tone: count >= 4 ? "green" : count >= 1 ? "amber" : "gray",
    };
  },
  toolsDocumented(count: number): PassportSignal {
    return {
      label: "Tools & workflow",
      value: count > 0 ? `${count} tool${count === 1 ? "" : "s"} documented` : "Not documented",
      detail: count > 0 ? "Creator lists tools and workflow steps" : "No tools or workflow documented yet",
      tone: count > 0 ? "green" : "gray",
    };
  },
  socialManual(platforms: number): PassportSignal {
    return {
      label: "Social account",
      value: platforms > 0 ? `${platforms} linked (manual entry)` : "None linked",
      detail: platforms > 0 ? "Metrics were entered manually — not from an official API" : "Link a social account in settings",
      tone: platforms > 0 ? "amber" : "gray",
    };
  },
  metricsSelfReported(lastUpdated: string | null): PassportSignal {
    return {
      label: "Metric source",
      value: lastUpdated ? "Self-reported" : "No metrics",
      detail: lastUpdated ? `Last updated ${lastUpdated}` : "No metric snapshots recorded",
      tone: lastUpdated ? "amber" : "gray",
    };
  },
  verification(status: string): PassportSignal {
    return {
      label: "Verification",
      value: status === "reviewed" ? "Reviewed by admin" : status === "rejected" ? "Not verified" : "Pending review",
      detail:
        status === "reviewed"
          ? "An authorized admin reviewed the evidence"
          : status === "rejected"
            ? "The last review rejected the request"
            : "Submitted evidence is awaiting admin review",
      tone: status === "reviewed" ? "green" : status === "rejected" ? "amber" : "gray",
    };
  },
  licensing(): PassportSignal {
    return {
      label: "Commercial licensing",
      value: "Preferences on file",
      detail: "License terms recorded with rate cards — confirm before contracting",
      tone: "amber",
    };
  },
  collaborations(count: number): PassportSignal {
    return {
      label: "Completed collaborations",
      value: count > 0 ? `${count} on platform` : "None on platform",
      detail: count > 0 ? "Completed projects recorded by the marketplace" : "Completed projects will appear here",
      tone: count > 0 ? "green" : "gray",
    };
  },
} as const;

export const PassportIcons = { FileText, Award, Sparkles, RotateCcw };
