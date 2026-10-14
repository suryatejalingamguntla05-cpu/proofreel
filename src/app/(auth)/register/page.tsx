import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoSession } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register — Proofreel",
  description: "Create a Proofreel account as a Creator or Brand.",
};

export default async function RegisterPage() {
  if (getDemoSession()) {
    redirect("/creators");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Join the marketplace as a Creator or a Brand in demo mode.
          </p>
        </div>

        <div className="mt-8 max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
          <Suspense fallback={<div className="h-64 w-full animate-pulse rounded bg-gray-200" />}>
            <RegistrationForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { RegistrationForm } from "./registration-form-client";
