import { redirect } from "react-router";
import type { Route } from "./+types/auth.callback";

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Handle OAuth callback with Supabase
  // const url = new URL(request.url);
  // const code = url.searchParams.get("code");

  return redirect("/");
}

export default function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Authenticating...</p>
    </div>
  );
}
