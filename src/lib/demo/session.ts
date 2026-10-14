export const DEMO_SESSION_KEY = "proofreel-demo-session";

export type DemoSession = {
  role: "creator" | "brand" | "agency";
  displayName: string;
  username: string;
  companyName?: string;
};

function parseDemoSession(raw: string | null): DemoSession | null {
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as DemoSession;
  } catch {
    try {
      return JSON.parse(raw) as DemoSession;
    } catch {
      return null;
    }
  }
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  return parseDemoSession(window.localStorage.getItem(DEMO_SESSION_KEY));
}

export async function getDemoSessionFromServer(): Promise<DemoSession | null> {
  try {
    const { cookies } = await import("next/headers");
    const raw = cookies().get(DEMO_SESSION_KEY)?.value ?? null;
    return parseDemoSession(raw);
  } catch {
    return null;
  }
}

export function saveDemoSession(session: DemoSession) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(session);
  window.localStorage.setItem(DEMO_SESSION_KEY, payload);
  document.cookie = `${DEMO_SESSION_KEY}=${encodeURIComponent(payload)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  document.cookie = `${DEMO_SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
