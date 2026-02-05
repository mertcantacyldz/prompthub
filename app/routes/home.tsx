import { useSearchParams, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { PromptList } from "~/components/prompt";
import { SearchBar, FilterPanel } from "~/components/search";
import { Pagination } from "~/components/custom";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { CATEGORIES } from "~/lib/utils/constants";
import { useState, useEffect } from "react";
import { getPrompts, type PromptFilters } from "~/lib/api";
import { toggleSavePrompt, isPromptSaved } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { PromptWithDetails } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PromptHub - Discover & Share AI Prompts" },
    {
      name: "description",
      content:
        "Discover, save, and share AI prompts for ChatGPT, Claude, Midjourney and more.",
    },
  ];
}

const PROMPTS_PER_PAGE = 12;

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [prompts, setPrompts] = useState<PromptWithDetails[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const filters: PromptFilters = {
          page: currentPage,
          limit: PROMPTS_PER_PAGE,
          search: searchParams.get("q") || undefined,
          categories: searchParams.getAll("category"),
          platforms: searchParams.getAll("platform"),
          modality: searchParams.get("modality") || undefined,
          sortBy: (searchParams.get("sort") as PromptFilters["sortBy"]) || "newest",
        };

        const result = await getPrompts(filters);
        setPrompts(result.data);
        setTotalPages(result.totalPages);
        setTotalCount(result.count);
      } catch (error) {
        console.error("Error fetching prompts:", error);
        toast({
          title: "Error",
          description: "Failed to load prompts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [searchParams, currentPage, toast]);

  // Load saved prompts for logged-in user
  useEffect(() => {
    const loadSavedStatus = async () => {
      if (!user || prompts.length === 0) return;

      const savedIds: string[] = [];
      for (const prompt of prompts) {
        try {
          const isSaved = await isPromptSaved(user.id, prompt.id);
          if (isSaved) savedIds.push(prompt.id);
        } catch {
          // Ignore errors
        }
      }
      setSavedPrompts(savedIds);
    };

    loadSavedStatus();
  }, [user, prompts]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`?${params.toString()}`);
  };

  const handleSave = async (id: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save prompts.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    try {
      const isSaved = await toggleSavePrompt(user.id, id);
      setSavedPrompts((prev) =>
        isSaved ? [...prev, id] : prev.filter((p) => p !== id)
      );
      toast({
        title: isSaved ? "Prompt saved" : "Prompt removed",
        description: isSaved
          ? "Added to your saved prompts."
          : "Removed from your saved prompts.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt. Please try again.",
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
            <span>Over 10,000 prompts shared</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Discover the Best{" "}
            <span className="text-accent-500">AI Prompts</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
            Find, save, and share prompts for ChatGPT, Claude, Midjourney, and
            more. Boost your AI productivity today.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="lg" placeholder="Search for prompts..." />
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
                  {category}
                </Badge>
              );
            })}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Badge variant="outline" className="cursor-pointer gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  More Filters
                </Badge>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        {/* Main Content */}
        <section className="flex gap-8">
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
              <div>
                <h2 className="text-2xl font-semibold">
                  {hasActiveFilters ? "Filtered Results" : "Trending Prompts"}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {isLoading ? "Loading..." : `Showing ${totalCount} prompts`}
                </p>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 rounded-full bg-accent-500 px-1.5 py-0.5 text-xs text-white">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Prompt Grid */}
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-[var(--muted-foreground)]">
                  No prompts found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <PromptList
                prompts={prompts}
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
    </div>
  );
}
