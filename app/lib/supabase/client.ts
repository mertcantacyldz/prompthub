import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "~/types/database";

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createBrowserClient<Database>(
    import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
  );

  return supabaseClient;
}

// Shorthand export
export const supabase = getSupabaseBrowserClient();
