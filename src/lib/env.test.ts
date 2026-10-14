import { afterEach, describe, expect, it } from "vitest";
import { appUrl } from "./env";

const envNames = ["NEXT_PUBLIC_APP_URL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"] as const;
const savedEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of envNames) {
    const value = savedEnv[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("appUrl", () => {
  it("prefers an explicitly configured canonical URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://proofreel.example/";
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "proofreel-git-feature.vercel.app";

    expect(appUrl()).toBe("https://proofreel.example");
  });

  it("uses the deployment URL for preview deployments", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "proofreel-git-feature.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "proofreel.vercel.app";

    expect(appUrl()).toBe("https://proofreel-git-feature.vercel.app");
  });

  it("uses the canonical Vercel production URL for production deployments", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "proofreel-hash.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "proofreel.vercel.app";

    expect(appUrl()).toBe("https://proofreel.vercel.app");
  });

  it("falls back to localhost outside Vercel", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    expect(appUrl()).toBe("http://localhost:3000");
  });
});
