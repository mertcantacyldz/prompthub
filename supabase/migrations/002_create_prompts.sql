-- =====================================================
-- 002_create_prompts.sql
-- Prompts tablosu - Ana içerik tablosu
-- =====================================================

-- Input modality enum type
CREATE TYPE input_modality AS ENUM ('text', 'image', 'file', 'audio', 'video');

-- Prompts tablosu
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    description TEXT CHECK (char_length(description) <= 1000),
    prompt_text TEXT NOT NULL CHECK (char_length(prompt_text) >= 10),
    categories TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(categories, 1) >= 1),
    ai_platforms TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(ai_platforms, 1) >= 1),
    input_modality input_modality NOT NULL DEFAULT 'text',
    is_public BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for better query performance
CREATE INDEX prompts_user_id_idx ON public.prompts(user_id);
CREATE INDEX prompts_is_public_idx ON public.prompts(is_public);
CREATE INDEX prompts_created_at_idx ON public.prompts(created_at DESC);
CREATE INDEX prompts_input_modality_idx ON public.prompts(input_modality);

-- GIN indexes for array columns (category ve platform filtreleme için)
CREATE INDEX prompts_categories_idx ON public.prompts USING GIN(categories);
CREATE INDEX prompts_ai_platforms_idx ON public.prompts USING GIN(ai_platforms);

-- Full-text search index (başlık ve açıklamada arama için)
CREATE INDEX prompts_search_idx ON public.prompts
    USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Updated_at trigger
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prompts tablosu için comment
COMMENT ON TABLE public.prompts IS 'AI promptları - kullanıcılar tarafından oluşturulan içerik';
COMMENT ON COLUMN public.prompts.categories IS 'Prompt kategorileri (çoklu seçim)';
COMMENT ON COLUMN public.prompts.ai_platforms IS 'En iyi çalıştığı AI platformları (çoklu seçim)';
