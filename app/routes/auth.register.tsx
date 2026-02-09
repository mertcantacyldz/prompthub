import { useState, useEffect } from "react";
import { Link, useNavigate, Form, useActionData, useNavigation, data, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Github, Mail, Loader2 } from "lucide-react";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { getSupabaseServerClient } from "~/lib/supabase";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import type { Route } from "./+types/auth.register";

export function meta() {
  return [
    { title: `${m.auth_registerMetaTitle()}` },
    { name: "description", content: m.auth_registerMetaDesc() },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = (formData.get("username") as string).toLowerCase();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (username.length < 3) {
    return data({ error: m.auth_usernameMin() }, { status: 400 });
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return data({ error: m.auth_usernameChars() }, { status: 400 });
  }
  if (password.length < 6) {
    return data({ error: m.auth_passwordMin() }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return data({ error: m.auth_passwordMismatch() }, { status: 400 });
  }

  const { supabase, headers } = getSupabaseServerClient(request);

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUser) {
    return data({ error: m.auth_usernameTaken() }, { status: 400 });
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  });

  if (signUpError) {
    return data({ error: signUpError.message }, { status: 400, headers });
  }

  // Update profile with username (Supabase trigger usually handles this, but being explicit)
  if (signUpData.user) {
    await supabase
      .from("profiles")
      .update({ username: username })
      .eq("id", signUpData.user.id);
  }

  return redirect("/auth/login?registered=true", { headers });
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const { toast } = useToast();

  const isRegistering = navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: m.auth_registrationFailed(),
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData, toast]);

  const handleGoogleLogin = async () => {
    setOauthLoading("google");
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: m.auth_registrationFailed(),
        description: error.message,
        variant: "destructive",
      });
      setOauthLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setOauthLoading("github");
    const { error } = await signInWithGithub();
    if (error) {
      toast({
        title: m.auth_registrationFailed(),
        description: error.message,
        variant: "destructive",
      });
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{m.auth_createAccount()}</CardTitle>
          <CardDescription>
            {m.auth_joinPromptopia()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Buttons */}
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {m.auth_continueWithGoogle()}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGithubLogin}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              {m.auth_continueWithGithub()}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-2 text-[var(--muted-foreground)]">
                {m.auth_orContinueWith()}
              </span>
            </div>
          </div>

          {/* Email Register Form */}
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="register" />
            <div className="space-y-2">
              <Label htmlFor="username">{m.auth_username()}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder={m.auth_usernamePlaceholder()}
                disabled={isRegistering}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{m.auth_email()}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={m.auth_emailPlaceholder()}
                disabled={isRegistering}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{m.auth_password()}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                disabled={isRegistering}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{m.auth_confirmPassword()}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                disabled={isRegistering}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {m.auth_createAccountBtn()}
            </Button>
          </Form>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            {m.auth_agreeToTermsPre()}{" "}
            <Link to={localizeHref("/terms")} className="text-accent-500 hover:underline">
              {m.auth_termsOfService()}
            </Link>{" "}
            {m.auth_and()}{" "}
            <Link to={localizeHref("/privacy")} className="text-accent-500 hover:underline">
              {m.auth_privacyPolicy()}
            </Link>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            {m.auth_alreadyHaveAccount()}{" "}
            <Link to={localizeHref("/auth/login")} className="text-accent-500 hover:underline">
              {m.common_login()}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
