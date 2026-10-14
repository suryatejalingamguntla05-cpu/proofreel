import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoSessionFromServer } from "@/lib/demo/session";
import { ProfileOnboardingForm } from "./profile-onboarding-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Complete your profile — Proofreel",
  description: "Tell us about yourself so we can match you with the right briefs.",
};

export default async function OnboardingPage() {
  const session = await getDemoSessionFromServer();

  if (!session) {
    redirect("/login");
  }

  const isBrand = session.role === "brand";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isBrand ? "Set up your brand" : "Complete your creator profile"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Welcome, {session.displayName}! A few details so the marketplace can route work to you.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
          <ProfileOnboardingForm isBrand={isBrand} />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          You can update everything later in{" "}
          <Link href="/settings" className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400">
            Settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
