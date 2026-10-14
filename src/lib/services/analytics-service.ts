/**
 * src/lib/services/analytics-service.ts
 * ---------------------------------------------------------------------------
 * Social metric snapshots and audience trends.
 *
 * The service aggregates `social_metric_snapshots` into readable charts and
 * time-series data. It never fabricates numbers: if there are no snapshots,
 * it returns empty arrays/zeroes and the UI shows an empty state.
 */

import { supabase } from "@/lib/supabase/client";
import type { socialMetricSnapshot } from "@/types/database";

// ---------------------------------------------------------------------------
// Fetch raw snapshots with source metadata (server-side)
// ---------------------------------------------------------------------------
export async function getSocialMetrics(creatorProfileId: string): Promise<socialMetricSnapshot[]> {
  const { data, error } = await supabase
    .from("social_metric_snapshots")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("captured_at", { ascending: true });
  if (error) throw error;
  return data as socialMetricSnapshot[];
}

export async function getSocialMetricsByAccount(creatorProfileId: string, platform: string) {
  const { data, error } = await supabase
    .from("social_metric_snapshots")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .eq("platform", platform)
    .order("captured_at", { ascending: true });
  if (error) throw error;
  return data as socialMetricSnapshot[];
}

// ---------------------------------------------------------------------------
// Aggregation for charts (time-series by day, with source classification)
// ---------------------------------------------------------------------------
export type MetricChartPoint = {
  day: string;
  date: string;
  followers: number;
  likes: number;
  views: number;
  total: number;
  source: "manual" | "api" | "user_submitted";
};

export type MetricsSummary = {
  totalSnapshots: number;
  latest: Record<string, number>;
  trends: MetricChartPoint[];
  lastUpdatedAt: string | null;
};

export async function summarizeMetrics(creatorProfileId: string): Promise<MetricsSummary> {
  const snapshots = await getSocialMetrics(creatorProfileId);
  if (!snapshots || snapshots.length === 0) {
    return {
      totalSnapshots: 0,
      latest: {},
      trends: [],
      lastUpdatedAt: null,
    };
  }

  // Latest snapshot per (platform, metric_name)
  const latestMap = new Map<string, socialMetricSnapshot>();
  for (const s of snapshots) {
    const key = `${s.platform}|${s.metric_name}`;
    const existing = latestMap.get(key);
    if (!existing || new Date(s.captured_at) > new Date(existing.captured_at)) {
      latestMap.set(key, s);
    }
  }

  const latest: Record<string, number> = {};
  for (const [, snap] of latestMap) {
    latest[`${snap.platform}_${snap.metric_name}`] = snap.value;
  }

  // Build daily series for a couple of common metrics
  const trends: MetricChartPoint[] = [];
  const byDay = new Map<string, Map<string, number>>();
  let lastUpdated: string | null = null;

  for (const s of snapshots) {
    if (!lastUpdated || new Date(s.captured_at) > new Date(lastUpdated)) {
      lastUpdated = s.captured_at;
    }
    const day = s.captured_at.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, new Map());
    const row = byDay.get(day)!;
    const key = `${s.platform}_${s.metric_name}`;
    if (!row.has(key)) row.set(key, 0);
    row.set(key, (row.get(key) ?? 0) + s.value);
  }

  const platforms: string[] = [];
  const metricNames: string[] = [];
  for (const [key] of latestMap) {
    const [platform, metric] = key.split("|");
    if (!platforms.includes(platform)) platforms.push(platform);
    if (!metricNames.includes(metric)) metricNames.push(metric);
  }

  const days = Array.from(byDay.keys()).sort();
  for (const day of days) {
    const row = byDay.get(day)!;
    const point: MetricChartPoint = { day, date: day, followers: 0, likes: 0, views: 0, total: 0, source: "manual" };
    metricNames.forEach((metric) => {
      const platform = platforms.find((p) => `${p}_${metric}` === keyFor(day, p, metric));
      if (platform) {
        const val = row.get(`${platform}_${metric}`) ?? 0;
        if (metric === "followers") point.followers = val;
        if (metric === "likes") point.likes = val;
        if (metric === "views") point.views = val;
        point.total += val;
      }
    });
    // Determine the dominant source for this day
    const sources = new Map<string, number>();
    for (const s of snapshots) {
      if (s.captured_at.slice(0, 10) === day) {
        sources.set(s.source_type, (sources.get(s.source_type) ?? 0) + 1);
      }
    }
    if (sources.size > 0) {
      point.source = [...sources.entries()].sort((a, b) => b[1] - a[1])[0]![0] as "manual" | "api" | "user_submitted";
    }
    trends.push(point);
  }

  return { totalSnapshots: snapshots.length, latest, trends, lastUpdatedAt: lastUpdated };
}

function keyFor(_day: string, platform: string, metric: string) {
  return `${platform}|${metric}`;
}

// ---------------------------------------------------------------------------
// Format helpers (reused across UI)
// ---------------------------------------------------------------------------
export function formatMetricValue(value: number, _unit?: string): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
