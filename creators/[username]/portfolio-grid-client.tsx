"use client";

import { useState } from "react";
import { Play, Eye, CheckCircle } from "lucide-react";
import type { portfolioItem } from "@/types/database";

const DEMO_ITEMS: portfolioItem[] = [
  {
    id: "p1",
    creator_profile_id: "demo_creator_1",
    title: "Neon Avenue",
    description: "Cinematic AI promo for a fashion brand.",
    category: "motion",
    content_type: "video",
    url: "https://example.com/neon-avenue",
    image_url: "https://images.unsplash.com/photo-1515879218967-110017n1uc0c?w=600&h=340&fit=crop",
    is_public: true,
    is_owned_by_creator: true,
    ownership_note: null,
    created_at: "2026-09-15T10:00:00Z",
    updated_at: "2026-09-15T10:00:00Z",
  },
  {
    id: "p2",
    creator_profile_id: "demo_creator_1",
    title: "Virtual Dancer",
    description: "AI-animated dancer synced to music. Experimental.",
    category: "animation",
    content_type: "video",
    url: "https://example.com/virtual-dancer",
    image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&h=340&fit=crop",
    is_public: true,
    is_owned_by_creator: true,
    ownership_note: null,
    created_at: "2026-09-10T10:00:00Z",
    updated_at: "2026-09-10T10:00:00Z",
  },
  {
    id: "p3",
    creator_profile_id: "demo_creator_2",
    title: "Rain City",
    description: "A generative cityscape that reacts to audio.",
    category: "3d",
    content_type: "animation",
    url: "https://example.com/rain-city",
    image_url: "https://images.unsplash.com/photo-1515072111853-8e9d7e5d0a0b?w=600&h=340&fit=crop",
    is_public: true,
    is_owned_by_creator: true,
    ownership_note: null,
    created_at: "2026-09-05T10:00:00Z",
    updated_at: "2026-09-05T10:00:00Z",
  },
  {
    id: "p4",
    creator_profile_id: "demo_creator_4",
    title: "Flow UI Kit",
    description: "A complete icon set and UI library.",
    category: "ui",
    content_type: "image",
    url: "https://example.com/flow-ui",
    image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop",
    is_public: true,
    is_owned_by_creator: true,
    ownership_note: null,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
];

export function PortfolioGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {DEMO_ITEMS.map((item) => (
        <PortfolioCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function PortfolioCard({ item }: { item: portfolioItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900">
      <div className="relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-36 w-full bg-gray-200 animate-pulse dark:bg-neutral-800" />
        )}
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
            {item.content_type === "video" ? "Video" : item.content_type.toUpperCase()}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-gray-700">
            <Eye className="w-3 h-3" /> {item.is_public ? "Public" : "Private"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {item.is_owned_by_creator ? "Owned by creator" : "Rights to confirm"}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-violet-600 hover:text-violet-500"
          >
            {expanded ? "Hide" : "View details"} <Play className="w-3 h-3 inline ml-1" />
          </button>
        </div>
        {expanded && (
          <div className="mt-2 text-sm text-gray-500">
            {item.ownership_note ? <p>Note: {item.ownership_note}</p> : <CheckCircle className="w-4 h-4 inline text-green-500" />}
          </div>
        )}
      </div>
    </div>
  );
}
