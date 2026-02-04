-- =====================================================
-- 003_create_ratings.sql
-- Ratings tablosu - Puanlama sistemi
-- =====================================================

-- Ratings tablosu
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Bir kullanıcı bir prompt'a sadece bir kez puan verebilir
    UNIQUE(user_id, prompt_id)
);

-- Indexes
CREATE INDEX ratings_prompt_id_idx ON public.ratings(prompt_id);
CREATE INDEX ratings_user_id_idx ON public.ratings(user_id);
CREATE INDEX ratings_score_idx ON public.ratings(score);

-- Updated_at trigger
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ortalama puan hesaplama view'i
CREATE OR REPLACE VIEW public.prompt_ratings AS
SELECT
    prompt_id,
    COUNT(*) as rating_count,
    ROUND(AVG(score)::numeric, 2) as average_rating
FROM public.ratings
GROUP BY prompt_id;

-- Ratings tablosu için comment
COMMENT ON TABLE public.ratings IS 'Prompt puanları - 1-5 yıldız sistemi';
COMMENT ON VIEW public.prompt_ratings IS 'Her prompt için ortalama puan ve toplam puan sayısı';
