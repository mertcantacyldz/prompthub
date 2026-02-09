import { Link } from "react-router";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { StarRating } from "~/components/custom";
import { Bookmark, Copy, Check, Loader2, Eye } from "lucide-react";
import { useCopyToClipboard } from "~/hooks";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { localizeHref } from "~/paraglide/runtime.js";
import { getCategoryDisplayName } from "~/lib/utils/i18n-helpers";
import * as m from "~/paraglide/messages.js";

export interface PromptCardProps {
  id: string;
  title: string;
  description: string | null;
  prompt_text: string;
  categories: string[];
  ai_platforms: string[];
  average_rating: number;
  rating_count: number;
  user: {
    username: string;
    avatar_url: string | null;
  };
  is_saved?: boolean;
  onSave?: (id: string) => void;
  view_count: number;
  copy_count: number;
  className?: string;
}

export function PromptCard({
  id,
  title,
  description,
  prompt_text,
  categories,
  ai_platforms,
  average_rating,
  rating_count,
  user,
  is_saved = false,
  view_count = 0,
  copy_count = 0,
  onSave,
  className,
}: PromptCardProps) {
  const { copy, copied } = useCopyToClipboard({
    successMessage: m.prompt_detail_copied(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copy(prompt_text);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    console.log("[PromptCard] Save button clicked for promptId:", id);
    setIsSaving(true);
    try {
      await onSave?.(id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link to={localizeHref(`/prompts/${id}`)} className="block h-full">
      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent-500/50",
          className
        )}
      >
        {/* Hover Actions - Top Right */}
        <div className="absolute right-2 top-2 z-10 flex gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white dark:bg-black/80 dark:hover:bg-black opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            disabled={isSaving}
            className={cn(
              "h-8 w-8 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white dark:bg-black/80 dark:hover:bg-black transition-all duration-300",
              is_saved
                ? "opacity-100 text-accent-500"
                : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            )}
            onClick={handleSave}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent-500" />
            ) : (
              <Bookmark
                className={cn("h-4 w-4", is_saved && "fill-current")}
              />
            )}
          </Button>
        </div>

        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold leading-snug line-clamp-2 transition-colors group-hover:text-accent-500">
              {title}
            </h3>
            {/* AI Platforms Badges in Header */}
            <div className="flex flex-wrap gap-1">
              {ai_platforms.slice(0, 2).map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className="bg-accent-500/5 text-[10px] h-5 px-1.5 font-semibold text-accent-700 dark:text-accent-400 border-accent-500/20"
                >
                  {platform}
                </Badge>
              ))}
              {ai_platforms.length > 2 && (
                <Badge
                  variant="outline"
                  className="bg-accent-500/5 text-[10px] h-5 px-1.5 font-semibold text-accent-700 dark:text-accent-400 border-accent-500/20"
                >
                  +{ai_platforms.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-4 leading-relaxed">
              {description}
            </p>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="bg-[var(--secondary)]/50 text-[11px] h-5 px-2">
                {getCategoryDisplayName(cat)}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="bg-[var(--secondary)]/50 text-[11px] h-5 px-2">
                +{categories.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 pt-4! ">
          <div className="flex w-full items-start justify-between gap-3">
            {/* Left: Author Info */}
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="h-8 w-8 border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-accent-500 text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-bold text-[var(--foreground)]">
                @{user.username}
              </span>
            </div>

            {/* Right: Stats and Rating Vertical Stack */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Rating Component */}
              <div className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-full border shadow-sm">
                <StarRating value={average_rating} readonly size="sm" className="gap-0.5" />
                <span className="text-[10px] font-black text-accent-600 dark:text-accent-400">
                  {average_rating.toFixed(1)}
                </span>
              </div>

              {/* Usage Stats (Views & Copies) */}
              <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)] font-semibold px-1">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Copy className="h-3 w-3" />
                  <span>{copy_count}</span>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}