import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 dark:bg-neutral-950">
      <div className="text-6xl font-bold text-gray-300">404</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          href="/creators"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Compass className="w-4 h-4" />
          Browse creators
        </Link>
      </div>
    </div>
  );
}
