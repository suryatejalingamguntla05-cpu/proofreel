import { SiteShell } from "@/components/layout/site-shell";

// Session-aware shell — rendered per request, never prerendered.
export const dynamic = "force-dynamic";

export default function AiStudioLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
