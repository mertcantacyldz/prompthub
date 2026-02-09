import { Link } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";

export function meta() {
  return [
    { title: `${m.notFound_metaTitle()} - Promptopia` },
    { name: "description", content: m.notFound_metaDesc() },
  ];
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <Container className="max-w-lg text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-accent-500/20">{m.notFound_404()}</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">{m.notFound_title()}</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          {m.notFound_description()}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to={localizeHref("/")}>
              <Home className="mr-2 h-4 w-4" />
              {m.common_goHome()}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={localizeHref("/?q=")}>
              <Search className="mr-2 h-4 w-4" />
              {m.notFound_browsePrompts()}
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {m.notFound_goBack()}
          </button>
        </div>
      </Container>
    </div>
  );
}
