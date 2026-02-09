import { Link, useNavigate, useLocation } from "react-router";
import { Plus, Search, User, LogOut, Settings, Bookmark } from "lucide-react";
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
import { ThemeToggle, LanguageSwitcher } from "~/components/custom";
import { Container } from "./container";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";

export function Header() {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/tr" || location.pathname === "/tr/";
  const { toast } = useToast();

  const displayUser = profile ? {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    avatar_url: profile.avatar_url,
  } : null;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: m.auth_loggedOut(),
        description: m.auth_loggedOutDesc(),
      });
      navigate(localizeHref("/"));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to={localizeHref("/")} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 shrink-0">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="hidden text-lg font-bold sm:inline-block md:text-xl">
              {m.common_appName()}
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {!isHomePage && (
            <div className="hidden flex-1 max-w-md md:block">
              <form action={localizeHref("/")} method="get">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    type="search"
                    name="q"
                    placeholder={m.common_searchPrompts()}
                    className="pl-10"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button - Mobile */}
            {!isHomePage && (
              <Button variant="ghost" size="icon" className="md:hidden" asChild>
                <Link to={localizeHref("/?search=true")}>
                  <Search className="h-5 w-5" />
                  <span className="sr-only">{m.common_search()}</span>
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {displayUser ? (
              <>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Saved Prompts - Desktop & Tablet */}
                  <Button variant="ghost" asChild className="hidden sm:inline-flex">
                    <Link to={localizeHref("/profile?tab=saved")} className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      <span>{m.common_saved()}</span>
                    </Link>
                  </Button>

                  {/* Saved Prompts - Mobile */}
                  <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                    <Link to={localizeHref("/profile?tab=saved")}>
                      <Bookmark className="h-5 w-5" />
                    </Link>
                  </Button>

                  {/* Add Prompt Button */}
                  <Button asChild className="hidden sm:inline-flex">
                    <Link to={localizeHref("/prompts/new")}>
                      <Plus className="mr-1 h-4 w-4" />
                      <span>{m.common_newPrompt()}</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                    <Link to={localizeHref("/prompts/new")}>
                      <Plus className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={displayUser.avatar_url || undefined}
                          alt={displayUser.username}
                        />
                        <AvatarFallback>
                          {displayUser.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{displayUser.username}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {displayUser.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={localizeHref("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        {m.common_profile()}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={localizeHref("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        {m.common_settings()}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      {m.common_logout()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="px-2 sm:px-4 text-sm">
                  <Link to={localizeHref("/auth/login")}>{m.common_login()}</Link>
                </Button>
                <Button asChild className="px-2 sm:px-4 text-sm">
                  <Link to={localizeHref("/auth/register")}>{m.common_signup()}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
