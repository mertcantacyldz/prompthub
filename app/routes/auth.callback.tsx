import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Container } from "~/components/layout";
import { supabase } from "~/lib/supabase";
import { Loader2 } from "lucide-react";

export function meta() {
  return [
    { title: "Authenticating... - PromptHub" },
  ];
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase handles the OAuth code exchange automatically via onAuthStateChange
        // We just need to wait for the session to be established
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth/login?error=auth_failed");
          return;
        }

        if (data.session) {
          // Successfully authenticated
          navigate("/");
        } else {
          // Check if there's a hash fragment (Supabase returns tokens in hash)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");

          if (accessToken) {
            // Wait a moment for Supabase to process the tokens
            setTimeout(async () => {
              const { data: retryData } = await supabase.auth.getSession();
              if (retryData.session) {
                navigate("/");
              } else {
                navigate("/auth/login");
              }
            }, 1000);
          } else {
            navigate("/auth/login");
          }
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        navigate("/auth/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Container className="max-w-md text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent-500" />
        <p className="mt-4 text-[var(--muted-foreground)]">
          Completing authentication...
        </p>
      </Container>
    </div>
  );
}
