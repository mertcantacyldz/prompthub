import { supabase } from "~/lib/supabase";
import type { Profile, ProfileUpdate } from "~/types";

// Get profile by user ID
export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data;
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data;
}

// Update profile
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data;
}

// Check if username is available
export async function isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase());

  // Exclude current user when checking
  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data, error } = await query.single();

  if (error && error.code === "PGRST116") {
    return true; // No match found, username is available
  }

  return !data;
}

// Upload avatar
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile with new avatar URL
  await updateProfile(userId, { avatar_url: data.publicUrl });

  return data.publicUrl;
}

// Delete avatar
export async function deleteAvatar(userId: string): Promise<void> {
  // Get current profile
  const profile = await getProfileById(userId);
  if (!profile?.avatar_url) return;

  // Extract file path from URL
  const urlParts = profile.avatar_url.split("/");
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `avatars/${fileName}`;

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from("avatars")
    .remove([filePath]);

  if (deleteError) {
    console.error("Error deleting avatar:", deleteError);
    // Continue anyway to clear the URL
  }

  // Clear avatar URL in profile
  await updateProfile(userId, { avatar_url: null });
}

// Get user stats
export async function getUserStats(userId: string): Promise<{
  promptCount: number;
  totalViews: number;
  totalCopies: number;
  savedCount: number;
}> {
  // Get prompt stats
  const { data: prompts, error: promptError } = await supabase
    .from("prompts")
    .select("view_count, copy_count")
    .eq("user_id", userId);

  if (promptError) {
    console.error("Error fetching prompt stats:", promptError);
    throw promptError;
  }

  // Get saved count
  const { count: savedCount, error: savedError } = await supabase
    .from("saved_prompts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (savedError) {
    console.error("Error fetching saved count:", savedError);
    throw savedError;
  }

  const totalViews = prompts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
  const totalCopies = prompts?.reduce((sum, p) => sum + (p.copy_count || 0), 0) || 0;

  return {
    promptCount: prompts?.length || 0,
    totalViews,
    totalCopies,
    savedCount: savedCount || 0,
  };
}
