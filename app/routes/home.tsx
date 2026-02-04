import { useSearchParams, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { PromptList } from "~/components/prompt";
import { SearchBar, FilterPanel } from "~/components/search";
import { Pagination } from "~/components/custom";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { CATEGORIES } from "~/lib/utils/constants";
import { useState } from "react";

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

// Temporary mock data - will be replaced with Supabase data
const MOCK_PROMPTS = [
  {
    id: "1",
    title: "Professional Email Writer",
    description:
      "Generate professional emails for any business context with proper tone and formatting.",
    prompt_text: "You are an expert professional email writer...",
    categories: ["Writing/Content", "Business"],
    ai_platforms: ["ChatGPT", "Claude"],
    average_rating: 4.5,
    rating_count: 128,
    user: { username: "promptmaster", avatar_url: null },
  },
  {
    id: "2",
    title: "Midjourney Portrait Generator",
    description:
      "Create stunning portrait images with cinematic lighting and professional composition.",
    prompt_text: "Create a portrait with cinematic lighting...",
    categories: ["Image Generation", "Design"],
    ai_platforms: ["Midjourney"],
    average_rating: 4.8,
    rating_count: 256,
    user: { username: "aiartist", avatar_url: null },
  },
  {
    id: "3",
    title: "Code Review Assistant",
    description:
      "Get detailed code reviews with suggestions for improvements, best practices, and potential bugs.",
    prompt_text: "Review this code and provide detailed feedback...",
    categories: ["Programming", "Technology"],
    ai_platforms: ["ChatGPT", "Claude", "Copilot"],
    average_rating: 4.7,
    rating_count: 89,
    user: { username: "devguru", avatar_url: null },
  },
  {
    id: "4",
    title: "SEO Meta Description Generator",
    description:
      "Generate compelling meta descriptions optimized for search engines and click-through rates.",
    prompt_text: "Generate an SEO-optimized meta description...",
    categories: ["SEO", "Marketing"],
    ai_platforms: ["ChatGPT", "Claude"],
    average_rating: 4.3,
    rating_count: 67,
    user: { username: "seoexpert", avatar_url: null },
  },
  {
    id: "5",
    title: "Creative Story Writer",
    description:
      "Generate engaging short stories with vivid characters and compelling plots.",
    prompt_text: "Write a creative short story about...",
    categories: ["Writing/Content", "Fun/Creative"],
    ai_platforms: ["ChatGPT", "Claude"],
    average_rating: 4.6,
    rating_count: 203,
    user: { username: "storyteller", avatar_url: null },
  },
  {
    id: "6",
    title: "Legal Document Analyzer",
    description:
      "Analyze legal documents and contracts for key terms, risks, and important clauses.",
    prompt_text: "Analyze this legal document and highlight...",
    categories: ["Legal", "Business"],
    ai_platforms: ["ChatGPT", "Claude"],
    average_rating: 4.4,
    rating_count: 45,
    user: { username: "legalai", avatar_url: null },
  },
  {
    id: "7",
    title: "Workout Plan Generator",
    description:
      "Create personalized workout plans based on fitness goals, equipment, and time constraints.",
    prompt_text: "Create a workout plan for...",
    categories: ["Health", "Life Coach"],
    ai_platforms: ["ChatGPT"],
    average_rating: 4.2,
    rating_count: 156,
    user: { username: "fitcoach", avatar_url: null },
  },
  {
    id: "8",
    title: "React Component Generator",
    description:
      "Generate clean, typed React components with proper hooks and best practices.",
    prompt_text: "Generate a React component that...",
    categories: ["Programming", "Technology"],
    ai_platforms: ["ChatGPT", "Claude", "Copilot"],
    average_rating: 4.9,
    rating_count: 312,
    user: { username: "reactdev", avatar_url: null },
  },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const totalPages = 5; // Mock pagination

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`?${params.toString()}`);
  };

  const handleSave = (id: string) => {
    setSavedPrompts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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
                  Showing {MOCK_PROMPTS.length} prompts
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
            <PromptList
              prompts={MOCK_PROMPTS}
              savedPromptIds={savedPrompts}
              onSave={handleSave}
            />

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
