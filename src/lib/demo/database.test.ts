import { describe, expect, it } from "vitest";
import {
  DEMO_BRIEFS,
  DEMO_CREATORS,
  getDemoBriefById,
  getDemoCreatorByUsername,
  getDemoPortfolio,
  getDemoTools,
  listDemoBriefs,
} from "./database";

describe("demo catalogue", () => {
  it("provides creator profiles with discoverable usernames", () => {
    expect(DEMO_CREATORS.length).toBeGreaterThan(0);
    expect(getDemoCreatorByUsername("aaraav_filmworks")?.profiles.display_name).toBe("Aarav Mehta");
    expect(getDemoCreatorByUsername("missing-creator")).toBeNull();
  });

  it("returns portfolio items and tools for a demo creator", () => {
    expect(getDemoPortfolio("demo-creator-1").length).toBeGreaterThan(0);
    expect(getDemoTools("demo-creator-1").map((tool) => tool.tool_name)).toContain("Runway");
    expect(getDemoPortfolio("unknown-creator")).toEqual([]);
    expect(getDemoTools("unknown-creator")).toEqual([]);
  });

  it("filters published briefs by query and content type", () => {
    expect(listDemoBriefs({ q: "fintech" }).map((brief) => brief.id)).toEqual(["demo-brief-2"]);
    expect(listDemoBriefs({ content_type: "3d" }).map((brief) => brief.id)).toEqual(["demo-brief-3"]);
    expect(listDemoBriefs({ q: "no matching brief" })).toEqual([]);
  });

  it("looks up a demo brief by id", () => {
    expect(getDemoBriefById("demo-brief-1")?.title).toBe("Lunar Launch — Brand Film");
    expect(getDemoBriefById("missing-brief")).toBeNull();
    expect(DEMO_BRIEFS.every((brief) => brief.status === "published")).toBe(true);
  });
});
