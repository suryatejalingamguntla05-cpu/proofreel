import { Clock } from "lucide-react";

export function AvailabilityBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
      <Clock className="w-3 h-3" />
      {text}
    </span>
  );
}
