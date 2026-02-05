import { supabase } from "~/lib/supabase";
import type { Prompt, PromptInsert, PromptUpdate, PromptWithDetails } from "~/types";

export interface PromptFilters {
  search?: string;
  categories?: string[];
  platforms?: string[];
  modality?: string;
  sortBy?: "newest" | "oldest" | "most_viewed" | "most_copied" | "highest_rated";
  userId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

// Get prompts with filters and pagination
export async function getPrompts(filters: PromptFilters = {}): Promise<PaginatedResponse<PromptWithDetails>> {
  const {
    search,
    categories,
    platforms,
    modality,
    sortBy = "newest",
    userId,
    isPublic = true,
    page = 1,
    limit = 12,
  } = filters;

  let query = supabase
    .from("prompts")
    .select(`
      *,
      profiles!prompts_user_id_fkey (username, avatar_url),
      prompt_ratings (prompt_id, rating_count, average_rating)
    `, { count: "exact" });

  // Filter by public/private
  if (isPublic) {
    query = query.eq("is_public", true);
  }

  // Filter by user
  if (userId) {
    query = query.eq("user_id", userId);
  }

  // Search in title and description
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,prompt_text.ilike.%${search}%`);
  }

  // Filter by categories (array contains any)
  if (categories && categories.length > 0) {
    query = query.overlaps("categories", categories);
  }

  // Filter by platforms (array contains any)
  if (platforms && platforms.length > 0) {
    query = query.overlaps("ai_platforms", platforms);
  }

  // Filter by modality
  if (modality) {
    query = query.eq("input_modality", modality);
  }

  // Sorting
  switch (sortBy) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "most_viewed":
      query = query.order("view_count", { ascending: false });
      break;
    case "most_copied":
      query = query.order("copy_count", { ascending: false });
      break;
    case "highest_rated":
      // Note: This requires a more complex query with joins
      query = query.order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    data: (data || []) as PromptWithDetails[],
    count: count || 0,
    page,
    totalPages,
  };
}

// Get single prompt by ID
export async function getPromptById(id: string): Promise<PromptWithDetails | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles!prompts_user_id_fkey (username, avatar_url),
      prompt_ratings (prompt_id, rating_count, average_rating)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching prompt:", error);
    throw error;
  }

  return data as PromptWithDetails;
}

// Create new prompt
export async function createPrompt(prompt: PromptInsert): Promise<Prompt> {
  const { data, error } = await supabase
    .from("prompts")
    .insert(prompt)
    .select()
    .single();

  if (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }

  return data;
}

// Update prompt
export async function updatePrompt(id: string, updates: PromptUpdate): Promise<Prompt> {
  const { data, error } = await supabase
    .from("prompts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating prompt:", error);
    throw error;
  }

  return data;
}

// Delete prompt
export async function deletePrompt(id: string): Promise<void> {
  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting prompt:", error);
    throw error;
  }
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_view_count", { prompt_id: id });

  // Fallback if RPC doesn't exist
  if (error) {
    await supabase
      .from("prompts")
      .update({ view_count: supabase.rpc("increment", { x: 1 }) as unknown as number })
      .eq("id", id);
  }
}

// Increment copy count
export async function incrementCopyCount(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_copy_count", { prompt_id: id });

  // Fallback if RPC doesn't exist
  if (error) {
    const { data: prompt } = await supabase
      .from("prompts")
      .select("copy_count")
      .eq("id", id)
      .single();

    if (prompt) {
      await supabase
        .from("prompts")
        .update({ copy_count: (prompt.copy_count || 0) + 1 })
        .eq("id", id);
    }
  }
}

// Get user's prompts
export async function getUserPrompts(userId: string, includePrivate = false): Promise<PromptWithDetails[]> {
  let query = supabase
    .from("prompts")
    .select(`
      *,
      profiles!prompts_user_id_fkey (username, avatar_url),
      prompt_ratings (prompt_id, rating_count, average_rating)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!includePrivate) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user prompts:", error);
    throw error;
  }

  return (data || []) as PromptWithDetails[];
}
