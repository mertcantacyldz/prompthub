-- =====================================================
-- 007_create_functions.sql
-- RPC fonksiyonları - İstatistikleri artırmak için
-- =====================================================

-- View sayısını artıran fonksiyon
CREATE OR REPLACE FUNCTION public.increment_view_count(prompt_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.prompts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = prompt_id;
END;
$$;

-- Kopyalama sayısını artıran fonksiyon
CREATE OR REPLACE FUNCTION public.increment_copy_count(prompt_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.prompts
  SET copy_count = COALESCE(copy_count, 0) + 1
  WHERE id = prompt_id;
END;
$$;

COMMENT ON FUNCTION public.increment_view_count IS 'Prompt görüntülenme sayısını güvenli bir şekilde artırır';
COMMENT ON FUNCTION public.increment_copy_count IS 'Prompt kopyalanma sayısını güvenli bir şekilde artırır';
