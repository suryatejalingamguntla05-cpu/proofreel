import { SiteShell } from "@/components/layout/site-shell";

// The shell resolves the session to render the signed-in header, so these
// pages are server-rendered per request by design rather than prerendered.
export const dynamic = "force-dynamic";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
