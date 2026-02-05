import { supabase } from "~/lib/supabase";
import type { Rating, RatingInsert } from "~/types";

// Get user's rating for a prompt
export async function getUserRating(userId: string, promptId: string): Promise<Rating | null> {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", userId)
    .eq("prompt_id", promptId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching rating:", error);
    throw error;
  }

  return data;
}

// Rate a prompt (create or update)
export async function ratePrompt(userId: string, promptId: string, score: number): Promise<Rating> {
  // Check if rating already exists
  const existingRating = await getUserRating(userId, promptId);

  if (existingRating) {
    // Update existing rating
    const { data, error } = await supabase
      .from("ratings")
      .update({ score, updated_at: new Date().toISOString() })
      .eq("id", existingRating.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating rating:", error);
      throw error;
    }

    return data;
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from("ratings")
      .insert({
        user_id: userId,
        prompt_id: promptId,
        score,
      } as RatingInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating rating:", error);
      throw error;
    }

    return data;
  }
}

// Delete rating
export async function deleteRating(userId: string, promptId: string): Promise<void> {
  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    console.error("Error deleting rating:", error);
    throw error;
  }
}

// Get prompt rating stats (uses the view)
export async function getPromptRatingStats(promptId: string): Promise<{ count: number; average: number }> {
  const { data, error } = await supabase
    .from("prompt_ratings")
    .select("rating_count, average_rating")
    .eq("prompt_id", promptId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { count: 0, average: 0 };
    }
    console.error("Error fetching rating stats:", error);
    throw error;
  }

  return {
    count: data?.rating_count || 0,
    average: data?.average_rating || 0,
  };
}
