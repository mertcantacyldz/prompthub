import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "~/types/database";

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;

  if (!url || !key) {
    console.error("[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  supabaseClient = createBrowserClient<Database>(url, key);

  return supabaseClient;
}

// Shorthand export
export const supabase = getSupabaseBrowserClient();
