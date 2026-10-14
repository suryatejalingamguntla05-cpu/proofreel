import { Suspense } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot password — Proofreel",
  description: "Request a password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
          <Suspense fallback={<div className="h-40 w-full animate-pulse rounded bg-gray-200" />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
