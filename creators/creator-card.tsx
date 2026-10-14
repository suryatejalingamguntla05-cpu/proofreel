import Link from "next/link";
import { Clock, Star, MapPin } from "lucide-react";
import { formatMinorUnits } from "@/lib/utils";

type CreatorCardData = {
  creator_profile_id: string;
  display_name: string;
  username: string;
  bio: string | null;
  location: string | null;
  languages: string[];
  avatar_url: string | null;
  portfolio_items_public: number;
  hourly_rate_minor: number;
  min_project_size_minor: number;
  verification_status: string | null;
  availability: string | null;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali", mr: "Marathi",
  gu: "Gujarati", kn: "Kannada", pa: "Punjabi", or: "Odia", ur: "Urdu",
};

export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  return (
    <Link
      href={`/creators/${creator.username}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
    >
      <div className="flex gap-4">
        {creator.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.avatar_url} alt={creator.display_name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {creator.display_name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-400">
            {creator.display_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{creator.username}</p>
          {creator.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" /> {creator.location}
            </p>
          )}
        </div>
      </div>

      {creator.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{creator.bio}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {creator.languages.slice(0, 3).map((lang) => (
          <span key={lang} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
            {LANGUAGE_LABELS[lang] ?? lang}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-neutral-800">
          <p className="text-[11px] text-gray-400">Rate</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {creator.hourly_rate_minor > 0 ? `${formatMinorUnits(creator.hourly_rate_minor)}/hr` : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-neutral-800">
          <p className="text-[11px] text-gray-400">Portfolio</p>
          <p className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
            <Star className="h-3.5 w-3.5 text-violet-500" /> {creator.portfolio_items_public}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-400">
          <Clock className="h-3 w-3" /> {creator.availability ?? "Availability not stated"}
        </span>
        {creator.verification_status && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {creator.verification_status}
          </span>
        )}
      </div>
    </Link>
  );
}
