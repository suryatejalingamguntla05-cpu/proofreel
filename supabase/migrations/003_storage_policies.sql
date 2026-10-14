-- ============================================================================
-- Proofreel — Supabase Storage policies
-- Apply AFTER 001_initial_schema.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Bucket creation
-- ----------------------------------------------------------------------------
-- When running `supabase db push`, the storage buckets are created via the
-- following statements if they do not already exist. If you prefer to manage
-- buckets through the Dashboard, comment these out.
-- ----------------------------------------------------------------------------

-- Bucket: portfolio-assets  (creator portfolio images/videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio-assets', 'portfolio-assets', false, 52428800, '["image/jpeg","image/png","image/webp","video/mp4","video/webm"]')
ON CONFLICT (id) DO NOTHING;

-- Bucket: deliverables-assets (creator/brand uploaded deliverable files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('deliverables-assets', 'deliverables-assets', false, 104857600, '["image/jpeg","image/png","image/webp","video/mp4","video/webm","application/pdf","application/zip","text/plain"]')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Policies for portfolio-assets
-- ----------------------------------------------------------------------------

CREATE POLICY "portfolio_assets_creator_full"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'portfolio-assets' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.creator_profiles cp
            JOIN public.profiles p ON p.id = cp.profile_id
            WHERE cp.id = (
                -- decode the storage path to find the creator profile id
                -- storage paths use: <profile_id>/<filename>
                SELECT split_part(usage_path, '/', 1)
            )
        )
    );

-- Allow public read of any portfolio asset (we control ownership at the DB layer)
CREATE POLICY "portfolio_assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-assets');

-- ----------------------------------------------------------------------------
-- Policies for deliverables-assets
-- ----------------------------------------------------------------------------

CREATE POLICY "deliverables_assets_collab_own"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'deliverables-assets' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.deliverables d
            WHERE d.id = (
                SELECT split_part(usage_path, '/', 1)
            )
        )
    );

-- Public read for deliverables (which are credited to a collaboration)
CREATE POLICY "deliverables_assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'deliverables-assets');

-- ----------------------------------------------------------------------------
-- Disable public access for ALL other buckets
-- ----------------------------------------------------------------------------

ALTER BUCKET "portfolio-assets" SET PUBLIC ACCESS RULE "public_access_disabled";
ALTER BUCKET "deliverables-assets" SET PUBLIC ACCESS RULE "public_access_disabled";

-- Fallback: deny any other bucket
CREATE POLICY "storage_deny_other"
    ON storage.objects FOR ALL
    USING (bucket_id NOT IN ('portfolio-assets', 'deliverables-assets'));
