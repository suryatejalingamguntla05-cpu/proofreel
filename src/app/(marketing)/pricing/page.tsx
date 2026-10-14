import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Creator",
    price: "Free",
    subtitle: "Build your portfolio",
    features: ["Portfolio showcase", "Proof passport", "Social metrics entry", "Verification request", "Deploy deliverables"],
    highlight: false,
  },
  {
    name: "Creator Plus",
    price: "₹499/mo",
    subtitle: "For active creators",
    features: ["Everything in Creator", "Unlimited portfolio items", "Tools & workflow documentation", "Match score & Fit Reports", "Priority support"],
    highlight: true,
  },
  {
    name: "Brand",
    price: "Free",
    subtitle: "Post briefs & hire",
    features: ["Post creative briefs", "Discover creators", "Receive quotes", "Manage collaborations", "Messages & notifications"],
    highlight: false,
  },
  {
    name: "Brand Agency",
    price: "Custom",
    subtitle: "For agencies",
    features: ["Everything in Brand", "Team seats", "API access", "Custom reporting", "Dedicated account manager"],
    highlight: false,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Pricing that scales with you
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Free to start. Upgrade when you need more.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 ${
              plan.highlight
                ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-neutral-900"
            }`}
          >
            {plan.highlight && (
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Popular</span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.subtitle}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.highlight ? "/brand" : "/register"}
              className={`mt-6 block text-center rounded-lg px-4 py-2 text-sm font-medium ${
                plan.highlight
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {plan.name === "Brand Agency" ? "Contact us" : "Choose " + plan.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
