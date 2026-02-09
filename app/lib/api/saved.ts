import { supabase } from "~/lib/supabase";
import type { SavedPrompt, PromptWithDetails } from "~/types";

// Helper for timeout — accepts PromiseLike (Supabase query builders are thenables)
const withTimeout = <T>(promise: PromiseLike<T>, name: string, ms = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${name} exceeded ${ms}ms`)), ms)
    )
  ]);
};

// Check if prompt is saved by user
export async function isPromptSaved(userId: string, promptId: string): Promise<boolean> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("saved_prompts")
        .select("id")
        .eq("user_id", userId)
        .eq("prompt_id", promptId)
        .maybeSingle(),
      "isPromptSaved"
    );

    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error("[saved] isPromptSaved failed:", err);
    throw err;
  }
}

// Save a prompt
export async function savePrompt(userId: string, promptId: string): Promise<SavedPrompt> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("saved_prompts")
        .insert({ user_id: userId, prompt_id: promptId })
        .select()
        .single(),
      "savePrompt"
    );

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[saved] savePrompt failed:", err);
    throw err;
  }
}

// Unsave a prompt
export async function unsavePrompt(userId: string, promptId: string): Promise<void> {
  try {
    const { error } = await withTimeout(
      supabase
        .from("saved_prompts")
        .delete()
        .eq("user_id", userId)
        .eq("prompt_id", promptId),
      "unsavePrompt"
    );

    if (error) throw error;
  } catch (err) {
    console.error("[saved] unsavePrompt failed:", err);
    throw err;
  }
}

// Toggle save status
export async function toggleSavePrompt(userId: string, promptId: string): Promise<boolean> {
  try {
    const isSaved = await isPromptSaved(userId, promptId);
    if (isSaved) {
      await unsavePrompt(userId, promptId);
      return false;
    } else {
      await savePrompt(userId, promptId);
      return true;
    }
  } catch (err) {
    console.error("[saved] toggleSavePrompt failed:", err);
    throw err;
  }
}

// Get user's saved prompts
export async function getSavedPrompts(userId: string): Promise<PromptWithDetails[]> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("saved_prompts")
        .select(`
          prompt_id,
          prompts!saved_prompts_prompt_id_fkey (
            *,
            profiles!prompts_user_id_fkey (username, avatar_url),
            prompt_ratings (prompt_id, rating_count, average_rating),
            prompt_save_counts (save_count)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      "getSavedPrompts"
    );

    if (error) throw error;

    return (data || [])
      .map((item: any) => {
        const p = item.prompts;
        if (!p) return null;
        const rating = Array.isArray(p.prompt_ratings) ? p.prompt_ratings[0] : p.prompt_ratings;
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        const saveCounts = Array.isArray(p.prompt_save_counts) ? p.prompt_save_counts[0] : p.prompt_save_counts;
        return {
          ...p,
          profiles: profile || { username: "unknown", avatar_url: null },
          prompt_ratings: rating || null,
          save_count: saveCounts?.save_count || 0
        } as PromptWithDetails;
      })
      .filter((prompt): prompt is PromptWithDetails => prompt !== null);
  } catch (err) {
    console.error("[saved] getSavedPrompts failed:", err);
    throw err;
  }
}

// Get save count for a prompt
export async function getPromptSaveCount(promptId: string): Promise<number> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("prompt_save_counts")
        .select("save_count")
        .eq("prompt_id", promptId)
        .maybeSingle(),
      "getPromptSaveCount"
    );

    if (error) throw error;
    return data?.save_count || 0;
  } catch (err) {
    console.error("[saved] getPromptSaveCount failed:", err);
    return 0;
  }
}
