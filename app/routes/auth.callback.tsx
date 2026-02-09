import { redirect } from "react-router";
import { Container } from "~/components/layout";
import { getSupabaseServerClient } from "~/lib/supabase";
import { Loader2 } from "lucide-react";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import type { Route } from "./+types/auth.callback";

export function meta() {
  return [
    { title: `${m.auth_authenticating()} - Promptopia` },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const { supabase, headers } = getSupabaseServerClient(request);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next, { headers });
    }
  }

  // return the user to an error page with instructions
  return redirect("/auth/login?error=auth_callback_failed");
}

export default function AuthCallback() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Container className="max-w-md text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent-500" />
        <p className="mt-4 text-[var(--muted-foreground)]">
          {m.auth_completingAuth()}
        </p>
      </Container>
    </div>
  );
}
