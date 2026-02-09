import { supabase } from "~/lib/supabase";
import type { SavedPrompt, PromptWithDetails } from "~/types";

// Check if prompt is saved by user
export async function isPromptSaved(userId: string, promptId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_prompts")
    .select("id")
    .eq("user_id", userId)
    .eq("prompt_id", promptId)
    .maybeSingle();

  if (error) {
    console.error("Error checking saved status:", error);
    throw error;
  }

  return !!data;
}

// Save a prompt
export async function savePrompt(userId: string, promptId: string): Promise<SavedPrompt> {
  const { data, error } = await supabase
    .from("saved_prompts")
    .insert({
      user_id: userId,
      prompt_id: promptId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving prompt:", error);
    throw error;
  }

  return data;
}

// Unsave a prompt
export async function unsavePrompt(userId: string, promptId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_prompts")
    .delete()
    .eq("user_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    console.error("Error unsaving prompt:", error);
    throw error;
  }
}

// Toggle save status
export async function toggleSavePrompt(userId: string, promptId: string): Promise<boolean> {
  const isSaved = await isPromptSaved(userId, promptId);

  if (isSaved) {
    await unsavePrompt(userId, promptId);
    return false;
  } else {
    await savePrompt(userId, promptId);
    return true;
  }
}

// Get user's saved prompts
export async function getSavedPrompts(userId: string): Promise<PromptWithDetails[]> {
  const { data, error } = await supabase
    .from("saved_prompts")
    .select(`
      prompt_id,
      prompts!saved_prompts_prompt_id_fkey (
        *,
        profiles!prompts_user_id_fkey (username, avatar_url),
        prompt_ratings (prompt_id, rating_count, average_rating)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved prompts:", error);
    throw error;
  }

  // Extract prompts from the nested structure and map to PromptWithDetails
  return (data || [])
    .map((item: any) => {
      const p = item.prompts;
      if (!p) return null;

      // Supabase joins return arrays, so we need to get the first element
      const rating = Array.isArray(p.prompt_ratings) ? p.prompt_ratings[0] : p.prompt_ratings;
      const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;

      return {
        ...p,
        profiles: profile || { username: "unknown", avatar_url: null },
        prompt_ratings: rating || null
      } as PromptWithDetails;
    })
    .filter((prompt): prompt is PromptWithDetails => prompt !== null);
}

// Get save count for a prompt
export async function getPromptSaveCount(promptId: string): Promise<number> {
  const { data, error } = await supabase
    .from("prompt_save_counts")
    .select("save_count")
    .eq("prompt_id", promptId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching save count:", error);
    throw error;
  }

  return data?.save_count || 0;
}
