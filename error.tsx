"use client";

import { useEffect } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 dark:bg-neutral-950">
      <div className="flex items-center justify-center gap-3 rounded-full bg-rose-100 p-4 dark:bg-rose-900/30">
        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        <span className="text-lg font-semibold text-rose-700 dark:text-rose-300">Something went wrong</span>
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Home className="w-4 h-4" />
          Back to home
        </Link>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-600">
        If this persists, contact support.
      </p>
    </div>
  );
}
