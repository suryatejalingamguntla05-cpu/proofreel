"use client";

import { useRouter } from "next/navigation";
import { useState, type ButtonHTMLAttributes } from "react";
import { clearDemoSession } from "@/lib/demo/session";

export function DashboardLogoutButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    clearDemoSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={loggingOut}
      className={className}
      {...props}
    >
      {loggingOut ? "Signing out…" : children}
    </button>
  );
}

export default DashboardLogoutButton;
