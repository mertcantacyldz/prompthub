import { redirect } from "react-router";
import { localizeHref } from "~/paraglide/runtime.js";
import { getSupabaseServerClient } from "~/lib/supabase";
import type { Route } from "./+types/auth.logout";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  await supabase.auth.signOut();
  return redirect(localizeHref("/"), { headers });
}

export async function loader() {
  return redirect(localizeHref("/"));
}
