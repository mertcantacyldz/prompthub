-- =====================================================
-- 004_create_saved_prompts.sql
-- Saved Prompts tablosu - Kaydedilen/Favoriler
-- =====================================================

-- Saved prompts tablosu
CREATE TABLE public.saved_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Bir kullanıcı bir prompt'u sadece bir kez kaydedebilir
    UNIQUE(user_id, prompt_id)
);

-- Indexes
CREATE INDEX saved_prompts_user_id_idx ON public.saved_prompts(user_id);
CREATE INDEX saved_prompts_prompt_id_idx ON public.saved_prompts(prompt_id);
CREATE INDEX saved_prompts_created_at_idx ON public.saved_prompts(created_at DESC);

-- Kaydedilme sayısı view'i
CREATE OR REPLACE VIEW public.prompt_save_counts AS
SELECT
    prompt_id,
    COUNT(*) as save_count
FROM public.saved_prompts
GROUP BY prompt_id;

-- Saved prompts tablosu için comment
COMMENT ON TABLE public.saved_prompts IS 'Kullanıcıların kaydettiği promptlar - Instagram kaydet gibi';
COMMENT ON VIEW public.prompt_save_counts IS 'Her prompt için kaydedilme sayısı';
