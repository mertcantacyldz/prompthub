import { Link } from "react-router";
import { Menu, Plus, Search, User, LogOut, Settings, Bookmark } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ThemeToggle } from "~/components/custom";
import { Container } from "./container";

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    username: string;
    avatar_url?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">
              PromptHub
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-md md:block">
            <form action="/" method="get">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  type="search"
                  name="q"
                  placeholder="Search prompts..."
                  className="pl-10"
                />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Button - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link to="/?search=true">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {/* Add Prompt Button */}
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/prompts/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Prompt
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                  <Link to="/prompts/new">
                    <Plus className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar_url || undefined}
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile?tab=saved">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Saved Prompts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action="/auth/logout" method="post">
                        <button type="submit" className="flex w-full items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
