import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/demo/session";
import { LoginFormClient } from "./login-form-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login — Proofreel",
  description: "Sign in to Proofreel.",
};

export default async function LoginPage() {
  if (getDemoSession()) {
    redirect("/creators");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Demo access is enabled. Sign in instantly to explore the marketplace.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
          <Suspense fallback={<div className="h-64 w-full animate-pulse rounded bg-gray-200" />}>
            <LoginFormClient />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
