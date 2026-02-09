import { useSearchParams, useNavigate, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { PromptList } from "~/components/prompt/prompt-list";
import { SearchBar, FilterPanel } from "~/components/search";
import { Pagination } from "~/components/custom";
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { CATEGORIES } from "~/lib/utils/constants";
import { getCategoryDisplayName } from "~/lib/utils/i18n-helpers";
import { useState, useEffect } from "react";
import { getPrompts, type PromptFilters, toggleSavePrompt } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { getSupabaseServerClient } from "~/lib/supabase";
import { localizeHref } from "~/paraglide/runtime.js";
import type { PromptWithDetails, InputModality } from "~/types";
import * as m from "~/paraglide/messages.js";
export function meta({ }: Route.MetaArgs) {
  return [
    { title: m.home_metaTitle() },
    { name: "description", content: m.home_metaDesc() },
  ];
}

const PROMPTS_PER_PAGE = 12;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const currentPage = parseInt(searchParams.get("page") || "1");
  const filters: PromptFilters = {
    page: currentPage,
    limit: PROMPTS_PER_PAGE,
    search: searchParams.get("q") || undefined,
    categories: searchParams.getAll("category"),
    platforms: searchParams.getAll("platform"),
    modality: (searchParams.get("modality") as InputModality) || undefined,
    sortBy: (searchParams.get("sort") as PromptFilters["sortBy"]) || "newest",
  };

  const { data: prompts, totalPages, count: totalCount } = await getPrompts(filters);

  // Load saved status for these prompts if user is logged in
  let savedPromptIds: string[] = [];
  if (userId && prompts.length > 0) {
    const { data: savedData } = await supabase
      .from("saved_prompts")
      .select("prompt_id")
      .eq("user_id", userId)
      .in("prompt_id", prompts.map(p => p.id));

    if (savedData) {
      savedPromptIds = (savedData as { prompt_id: string }[]).map(s => s.prompt_id);
    }
  }

  return {
    prompts,
    totalPages,
    totalCount,
    savedPromptIds,
    currentPage,
  };
}

export default function Home() {
  const { prompts: initialPrompts, totalPages, totalCount, savedPromptIds: initialSavedIds, currentPage } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [savedPrompts, setSavedPrompts] = useState<string[]>(initialSavedIds);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Update saved status when initial data changes (e.g. after navigation)
  useEffect(() => {
    setSavedPrompts(initialSavedIds);
  }, [initialSavedIds]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`?${params.toString()}`);
  };

  const handleSave = async (id: string) => {
    if (!user) {
      toast({
        title: m.home_loginRequired(),
        description: m.home_loginToSave(),
        variant: "destructive",
      });
      navigate(localizeHref("/auth/login"));
      return;
    }

    try {
      const isSaved = await toggleSavePrompt(user.id, id);
      setSavedPrompts((prev) =>
        isSaved ? [...prev, id] : prev.filter((p) => p !== id)
      );
      toast({
        title: isSaved ? m.home_promptSaved() : m.home_promptRemoved(),
        description: isSaved
          ? m.home_addedToSaved()
          : m.home_removedFromSaved(),
      });
    } catch (error) {
      toast({
        title: m.common_error(),
        description: m.home_saveFailed(),
        variant: "destructive",
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams);
    const currentCategories = params.getAll("category");

    if (currentCategories.includes(category)) {
      params.delete("category");
      currentCategories
        .filter((c) => c !== category)
        .forEach((c) => params.append("category", c));
    } else {
      params.append("category", category);
    }

    params.delete("page");
    navigate(`?${params.toString()}`);
  };

  const hasActiveFilters =
    searchParams.getAll("category").length > 0 ||
    searchParams.getAll("platform").length > 0 ||
    searchParams.get("modality");

  return (
    <div className="py-8">
      <Container>
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 px-4 py-1.5 text-sm text-accent-600 dark:text-accent-400 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>{m.home_heroTag()}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {m.home_heroTitlePart1()}{" "}
            <span className="text-accent-500">{m.home_heroHighlight()}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
            {m.home_heroDescription()}
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="lg" placeholder={m.home_searchPlaceholder()} />
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((category) => {
              const isActive = searchParams.getAll("category").includes(category);
              return (
                <Badge
                  key={category}
                  variant={isActive ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-accent-500 hover:text-white transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  {getCategoryDisplayName(category)}
                </Badge>
              );
            })}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs lg:hidden">
                  <SlidersHorizontal className="h-3 w-3" />
                  {m.common_filters()}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[350px] sm:w-[400px] flex flex-col">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {m.common_filters()}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto flex-1">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        {/* Main Content */}
        <section className="flex lg:gap-8 mt-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Prompts */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight">
                  {hasActiveFilters ? m.home_filteredResults() : m.home_trendingPrompts()}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {m.home_showingCount({ count: String(totalCount) })}
                </p>
              </div>

            </div>

            {/* Prompt Grid */}
            {initialPrompts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-[var(--muted-foreground)]">
                  {m.home_noPrompts()}
                </p>
              </div>
            ) : (
              <PromptList
                prompts={initialPrompts}
                savedPromptIds={savedPrompts}
                onSave={handleSave}
              />
            )}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </section>
      </Container>
    </div >
  );
}
