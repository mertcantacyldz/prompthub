import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database";

export function getSupabaseServerClient(request: Request): { supabase: SupabaseClient<Database>; headers: Headers } {
  const headers = new Headers();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
          return cookies.filter((cookie): cookie is { name: string; value: string } => !!cookie.value);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
    }
  );

  return { supabase, headers };
}

// Helper to get user from request
export async function getUser(request: Request) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper to get session from request
// WARNING: Using session.user data can be insecure as it's not verified by Supabase Auth server.
// Use getUser(request) instead for security-sensitive operations.
export async function getSession(request: Request) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Helper to require authentication (for protected routes)
export async function requireAuth(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}
