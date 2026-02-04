-- =====================================================
-- 006_create_storage.sql
-- Storage bucket - Avatar yüklemeleri için
-- =====================================================

-- Avatars bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Herkes avatarları görebilir (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Kullanıcılar kendi avatarlarını yükleyebilir
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Kullanıcılar kendi avatarlarını güncelleyebilir
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Kullanıcılar kendi avatarlarını silebilir
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Comment
COMMENT ON POLICY "Avatar images are publicly accessible" ON storage.objects IS 'Avatarlar herkese açık';
