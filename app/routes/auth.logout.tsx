import { redirect } from "react-router";
import type { Route } from "./+types/auth.logout";

export async function action({ request }: Route.ActionArgs) {
  // TODO: Handle logout with Supabase
  return redirect("/");
}

export async function loader() {
  return redirect("/");
}
