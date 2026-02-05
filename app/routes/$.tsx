import { Link } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export function meta() {
  return [
    { title: "Page Not Found - PromptHub" },
    { name: "description", content: "The page you're looking for doesn't exist" },
  ];
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <Container className="max-w-lg text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-accent-500/20">404</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/?q=">
              <Search className="mr-2 h-4 w-4" />
              Browse Prompts
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
            Go back to previous page
          </button>
        </div>
      </Container>
    </div>
  );
}
