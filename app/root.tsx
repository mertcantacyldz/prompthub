import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { ThemeProvider, AuthProvider } from "~/context";
import { Header, Footer } from "~/components/layout";
import { TooltipProvider, Toaster } from "~/components/ui";
import { paraglideMiddleware } from "~/paraglide/server.js";
import { getLocale } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import "./app.css";

import type { MiddlewareFunction } from "react-router";

export const middleware: MiddlewareFunction[] = [
  (ctx, next) => paraglideMiddleware(ctx.request.clone(), () => next()),
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' || !theme ? systemTheme : theme;
                document.documentElement.classList.add(resolvedTheme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] font-sans antialiased" suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { data } from "react-router";
import { getSupabaseServerClient } from "~/lib/supabase";
import type { Profile } from "~/types/database";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData as Profile | null;
  }

  return data(
    {
      user: user ?? null,
      profile,
    },
    { headers }
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { user, profile } = loaderData;

  return (
    <ThemeProvider>
      <AuthProvider
        initialUser={user}
        initialProfile={profile}
      >
        <TooltipProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = m.error_oops();
  let details = m.error_unexpectedError();
  let stack: string | undefined;
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    is404 = error.status === 404;
    message = is404 ? m.error_404() : m.error_error();
    details = is404
      ? m.error_pageNotFoundDesc()
      : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center max-w-lg mx-auto">
            <h1 className="text-8xl font-bold text-accent-500/20 mb-4">{message}</h1>
            <h2 className="text-2xl font-bold mb-2">
              {is404 ? m.error_pageNotFound() : m.error_somethingWentWrong()}
            </h2>
            <p className="text-[var(--muted-foreground)] mb-8">{details}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
              >
                {m.common_goHome()}
              </a>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
              >
                {m.common_goBack()}
              </button>
            </div>

            {stack && (
              <pre className="mt-8 max-w-2xl overflow-x-auto rounded-lg bg-[var(--muted)] p-4 text-left text-xs">
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </main>
      </AuthProvider>
    </ThemeProvider>
  );
}
