-- ============================================================
-- SMART JEWELLERS — SUPABASE STORAGE SETUP (shop-logos)
-- ============================================================

-- Create storage bucket for shop logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view shop logos
CREATE POLICY "Public Shop Logos Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'shop-logos');

-- Policy: Authenticated users can upload shop logos
CREATE POLICY "Authenticated users can upload shop logos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');

-- Policy: Users can update/delete their shop logos
CREATE POLICY "Users can manage shop logos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');
