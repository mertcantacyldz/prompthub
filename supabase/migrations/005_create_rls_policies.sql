-- =====================================================
-- 005_create_rls_policies.sql
-- Row Level Security Policies - Güvenlik kuralları
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES ====================

-- Herkes public profilleri görebilir
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Kullanıcı sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==================== PROMPTS ====================

-- Herkes public promptları görebilir
CREATE POLICY "Public prompts are viewable by everyone"
    ON public.prompts FOR SELECT
    USING (is_public = true);

-- Kullanıcı kendi private promptlarını görebilir
CREATE POLICY "Users can view their own private prompts"
    ON public.prompts FOR SELECT
    USING (auth.uid() = user_id AND is_public = false);

-- Giriş yapmış kullanıcılar prompt ekleyebilir
CREATE POLICY "Authenticated users can create prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı sadece kendi promptlarını güncelleyebilir
CREATE POLICY "Users can update their own prompts"
    ON public.prompts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı sadece kendi promptlarını silebilir
CREATE POLICY "Users can delete their own prompts"
    ON public.prompts FOR DELETE
    USING (auth.uid() = user_id);

-- ==================== RATINGS ====================

-- Herkes ratingleri görebilir (public promptlar için)
CREATE POLICY "Ratings are viewable by everyone"
    ON public.ratings FOR SELECT
    USING (true);

-- Giriş yapmış kullanıcılar puan verebilir
CREATE POLICY "Authenticated users can rate prompts"
    ON public.ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi puanını güncelleyebilir
CREATE POLICY "Users can update their own rating"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi puanını silebilir
CREATE POLICY "Users can delete their own rating"
    ON public.ratings FOR DELETE
    USING (auth.uid() = user_id);

-- ==================== SAVED PROMPTS ====================

-- Kullanıcı sadece kendi kaydettiklerini görebilir
CREATE POLICY "Users can view their own saved prompts"
    ON public.saved_prompts FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcı prompt kaydedebilir
CREATE POLICY "Authenticated users can save prompts"
    ON public.saved_prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kaydını silebilir (unsave)
CREATE POLICY "Users can unsave prompts"
    ON public.saved_prompts FOR DELETE
    USING (auth.uid() = user_id);

-- ==================== COMMENTS ====================
COMMENT ON POLICY "Profiles are viewable by everyone" ON public.profiles IS 'Tüm profiller herkese açık';
COMMENT ON POLICY "Public prompts are viewable by everyone" ON public.prompts IS 'is_public=true olan promptlar herkes tarafından görülebilir';
COMMENT ON POLICY "Users can view their own private prompts" ON public.prompts IS 'Kullanıcı kendi private promptlarını görebilir';
