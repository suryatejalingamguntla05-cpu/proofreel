import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getDemoSessionFromServer } from "@/lib/demo/session";

export async function resolveNavUser() {
  const session = await getDemoSessionFromServer();
  if (!session) return null;

  return {
    display_name: session.displayName,
    username: session.username,
    role: session.role,
    avatar_url: null,
  };
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await resolveNavUser();

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-ink-100">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar user={user} isAuthed={Boolean(user)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
