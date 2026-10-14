import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "proofreel",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      geminiKey: process.env.GEMINI_API_KEY ? "SET" : "MISSING",
    },
    // Features available:
    //  - Authentication & protected routes
    //  - Creator profiles & portfolios
    //  - Brand briefs & collaboration
    //  - Creative Fit Report (deterministic)
    //  - AI Brief Builder (with template fallback)
    //  - Social metrics (manual entry + connectors)
    //  - Verification (admin, server-side)
    //  - Collaboration messages & notifications
  });
}
