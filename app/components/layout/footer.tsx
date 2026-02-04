import { Link } from "react-router";
import { Github, Twitter } from "lucide-react";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-500">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              PromptHub &copy; {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Terms
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
