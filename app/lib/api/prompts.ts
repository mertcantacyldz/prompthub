import { supabase } from "~/lib/supabase";
import type { Prompt, PromptInsert, PromptUpdate, PromptWithDetails, InputModality } from "~/types";

export interface PromptFilters {
  search?: string;
  categories?: string[];
  platforms?: string[];
  modality?: InputModality;
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

// Internal type for Supabase query results
interface RawPromptResponse extends Prompt {
  profiles: { username: string; avatar_url: string | null } | { username: string; avatar_url: string | null }[];
  prompt_ratings: { rating_count: number; average_rating: number } | { rating_count: number; average_rating: number }[];
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
      prompt_ratings (rating_count, average_rating)
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

  return {
    data: ((data as unknown as RawPromptResponse[]) || []).map(p => {
      const rating = Array.isArray(p.prompt_ratings) ? p.prompt_ratings[0] : p.prompt_ratings;
      const profiles = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      return {
        ...(p as unknown as Prompt),
        profiles: profiles || { username: "unknown", avatar_url: null },
        prompt_ratings: (rating as PromptWithDetails['prompt_ratings']) || null
      } as PromptWithDetails;
    }),
    count: count || 0,
    page: filters.page || 1,
    totalPages: Math.ceil((count || 0) / (filters.limit || 10)),
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
    .maybeSingle();

  if (error) {
    console.error("Error fetching prompt:", error);
    throw error;
  }

  if (data) {
    const rating = Array.isArray(data.prompt_ratings) ? data.prompt_ratings[0] : data.prompt_ratings;
    const profiles = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    return {
      ...(data as Prompt),
      profiles: profiles as PromptWithDetails['profiles'],
      prompt_ratings: (rating as PromptWithDetails['prompt_ratings']) || null,
    };
  }

  return null;
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
  if (error) {
    console.error("Error incrementing view count:", error);
    throw error;
  }
}

// Increment copy count
export async function incrementCopyCount(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_copy_count", { prompt_id: id });
  if (error) {
    console.error("Error incrementing copy count:", error);
    throw error;
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

  return ((data as unknown as RawPromptResponse[]) || []).map(p => {
    const rating = Array.isArray(p.prompt_ratings) ? p.prompt_ratings[0] : p.prompt_ratings;
    const profiles = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return {
      ...(p as unknown as Prompt),
      profiles: profiles || { username: "unknown", avatar_url: null },
      prompt_ratings: (rating as PromptWithDetails['prompt_ratings']) || null,
    } as PromptWithDetails;
  });
}
