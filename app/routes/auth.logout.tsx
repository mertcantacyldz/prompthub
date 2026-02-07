import { redirect } from "react-router";
import { getSupabaseServerClient } from "~/lib/supabase";
import type { Route } from "./+types/auth.logout";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  await supabase.auth.signOut();
  return redirect("/", { headers });
}

export async function loader() {
  return redirect("/");
}
