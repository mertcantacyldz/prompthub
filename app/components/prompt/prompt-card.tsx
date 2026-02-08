import { Link } from "react-router";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { StarRating } from "~/components/custom";
import { Bookmark, Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "~/hooks";
import { cn } from "~/lib/utils";

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
  onSave,
  className,
}: PromptCardProps) {
  const { copy, copied } = useCopyToClipboard({
    successMessage: "Prompt copied to clipboard!",
  });

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copy(prompt_text);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(id);
  };

  return (
    <Link to={`/prompts/${id}`}>
      <Card
        className={cn(
          "group h-full cursor-pointer transition-all hover:shadow-lg hover:border-accent-500/50",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-accent-500 transition-colors">
              {title}
            </h3>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  is_saved
                    ? "text-accent-500"
                    : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                onClick={handleSave}
              >
                <Bookmark
                  className={cn("h-4 w-4", is_saved && "fill-current")}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{categories.length - 2}
              </Badge>
            )}
          </div>

          {/* AI Platforms */}
          <div className="flex flex-wrap gap-1">
            {ai_platforms.slice(0, 3).map((platform) => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
            {ai_platforms.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ai_platforms.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex w-full flex-col gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <StarRating value={average_rating} readonly size="sm" />
              <span className="text-xs text-[var(--muted-foreground)]">
                ({rating_count})
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-[var(--muted-foreground)] font-medium">
                @{user.username}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
