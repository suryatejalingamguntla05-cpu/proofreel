"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDemoSession } from "@/lib/demo/session";

export function LoginFormClient() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [email, setEmail] = useState("demo@proofreel.app");
  const [password, setPassword] = useState("demo12345");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const value = email.trim().toLowerCase();
    if (!value || !password.trim()) {
      setServerError("Enter a demo email and password.");
      return;
    }

    const role = value.includes("brand") ? "brand" : "creator";
    saveDemoSession({
      role,
      displayName: role === "brand" ? "Northstar Studio" : "Aarav Mehta",
      username: role === "brand" ? "northstarstudio" : "aaraav_filmworks",
      companyName: role === "brand" ? "Northstar Studio" : undefined,
    });

    router.replace(role === "brand" ? "/briefs" : "/creators");
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {serverError && (
        <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
        />
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-violet-200">
        Demo sign-in: use any email, password works. Brand emails include “brand” to enter the agency flow.
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Enter demo workspace
      </button>
    </form>
  );
}
