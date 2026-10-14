-- ============================================================================
-- Proofreel — Seed / demo data
--
-- IMPORTANT: This file MUST ONLY be run against a FRESH development database.
-- It NEVER silently replaces production data. In production, seed data is only
-- ever loaded via the documented "db:seed" command on a disposable sandbox.
-- ============================================================================

-- ============================================================================
-- TEMP HACK: Supabase `supabase db push` does not provide SQL injection for
-- seeding full rows across all tables. We create a "demo data" table that the
-- app's "demo mode" service uses to seed in-memory, clearly labeled records.
-- For production, use a real seed CLI script instead.
-- ============================================================================

-- ------------------------------------------------------------
-- Cleared: seed the public demo data table
-- ------------------------------------------------------------

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Demo data table (safe: only used by the documented demo-mode seed script)
  CREATE TABLE IF NOT EXISTS public.demo_seed_records (
    table_name TEXT NOT NULL,
    payload    JSONB NOT NULL,
    source     TEXT NOT NULL DEFAULT 'demo-demo',  -- clearly marked as demo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Clean any stale rows so re-running is idempotent
  DELETE FROM public.demo_seed_records;

  -- ------------------------------------------------------------
  -- DEMO RECORD LIFECYCLE START
  -- ------------------------------------------------------------
  -- These profiles are FAKE demo accounts. They are never real users.
  -- Insert them through the documented seed script so RLS/triggers can fire.
  -- (Actual inserts are done via lib/seed.ts which inserts into the real
  -- tables and then records metadata rows above.)
  INSERT INTO public.demo_seed_records (table_name, payload, source)
  VALUES
    ('demo_profile_creators', '[{"auth_id":"00000000-0000-0000-0000-000000000001","display_name":"Demo Creator","username":"demo_creator_1","bio":"AI filmmaker specializing in cinematic promos","role":"creator","is_public":true}]', 'demo'),
    ('demo_profile_brands',   '[{"auth_id":"00000000-0000-0000-0000-000000000002","display_name":"Demo Brand","username":"demo_brand_1","role":"brand","is_public":true}]', 'demo');
  -- ------------------------------------------------------------
END $$;
