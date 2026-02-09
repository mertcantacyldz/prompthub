import { PromptCard, type PromptCardProps } from "./prompt-card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import * as m from "~/paraglide/messages.js";

import type { PromptWithDetails } from "~/types";

interface PromptListProps {
  prompts: PromptWithDetails[];
  savedPromptIds?: string[];
  onSave?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function PromptList({
  prompts,
  savedPromptIds = [],
  onSave,
  isLoading = false,
  className,
}: PromptListProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-[var(--muted-foreground)]">
          {m.promptList_noPrompts()}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {m.promptList_adjustFilters()}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {prompts.map((prompt) => (
        <div key={prompt.id} className="w-full min-w-0">
          <PromptCard
            id={prompt.id}
            title={prompt.title}
            description={prompt.description}
            prompt_text={prompt.prompt_text}
            categories={prompt.categories}
            ai_platforms={prompt.ai_platforms}
            average_rating={prompt.prompt_ratings?.average_rating || 0}
            rating_count={prompt.prompt_ratings?.rating_count || 0}
            user={{
              username: prompt.profiles?.username || "unknown",
              avatar_url: prompt.profiles?.avatar_url || null,
            }}
            is_saved={savedPromptIds.includes(prompt.id)}
            view_count={prompt.view_count || 0}
            copy_count={prompt.copy_count || 0}
            onSave={onSave}
          />
        </div>
      ))}
    </div>
  );
}

function PromptCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border)] p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
