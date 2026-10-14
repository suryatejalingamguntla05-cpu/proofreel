"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDemoSession } from "@/lib/demo/session";

export function RegistrationForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [email, setEmail] = useState("brand-demo@proofreel.app");
  const [displayName, setDisplayName] = useState("Northstar Studio");
  const [username, setUsername] = useState("northstarstudio");
  const [role, setRole] = useState<"creator" | "brand">("brand");
  const [companyName, setCompanyName] = useState("Northstar Studio");
  const [password, setPassword] = useState("demo12345");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!displayName.trim() || !username.trim()) {
      setServerError("Name and username are required.");
      return;
    }
    if (role === "brand" && !companyName.trim()) {
      setServerError("Company name is required for brand accounts.");
      return;
    }

    saveDemoSession({
      role,
      displayName: displayName.trim(),
      username: username.trim(),
      companyName: companyName.trim() || undefined,
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Display name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">I am joining as</span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-1 dark:border-gray-700">
          {(["creator", "brand"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                role === value
                  ? "bg-violet-600 text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {role === "brand" && (
        <div>
          <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Company name</label>
          <input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-neutral-800"
        />
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-violet-200">
        Demo mode is active. Nothing is sent to Supabase; it simply unlocks the marketplace experience instantly.
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Create demo account
      </button>
    </form>
  );
}
