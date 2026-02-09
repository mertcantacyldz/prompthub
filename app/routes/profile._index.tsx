import { Link, useNavigate, useSearchParams, useLoaderData, redirect } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { StarRating } from "~/components/custom";
import { Edit, Bookmark, Grid, Settings, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabaseServerClient } from "~/lib/supabase";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { localizeHref } from "~/paraglide/runtime.js";
import { getCategoryDisplayName } from "~/lib/utils/i18n-helpers";
import * as m from "~/paraglide/messages.js";
import type { Profile, Prompt, PromptWithDetails } from "~/types/database";
import type { Route } from "./+types/profile._index";

export function meta() {
  return [
    { title: `${m.profile_myProfile()} - PromptHub` },
    { name: "description", content: m.profile_myProfileDesc() },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(localizeHref("/auth/login?redirectTo=/profile"));
  }

  const userId = user.id;

  // Fetch all data in parallel
  const [
    profileRes,
    promptsRes,
    savedRes,
    statsPromptsRes,
    statsSavedRes
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("prompts").select(`
      *,
      profiles (username, avatar_url),
      prompt_ratings (average_rating, rating_count)
    `).eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("saved_prompts").select(`
      prompt_id,
      prompts (
        *,
        profiles (username, avatar_url),
        prompt_ratings (average_rating, rating_count)
      )
    `).eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("prompts").select("view_count, copy_count").eq("user_id", userId),
    supabase.from("saved_prompts").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  if (profileRes.error) {
    console.error("Error fetching profile:", profileRes.error);
  }
  const profile = profileRes.data;

  interface RawPromptResponse extends Prompt {
    profiles: { username: string; avatar_url: string | null } | { username: string; avatar_url: string | null }[];
    prompt_ratings: { average_rating: number; rating_count: number; prompt_id: string } | { average_rating: number; rating_count: number; prompt_id: string }[];
  }

  // Transform prompts to match the UI expectations (flat ratings)
  const transformPrompt = (p: unknown): PromptWithDetails => {
    const raw = p as RawPromptResponse;
    const rating = Array.isArray(raw.prompt_ratings) ? raw.prompt_ratings[0] : raw.prompt_ratings;
    const profile = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
    return {
      ...(raw as Prompt),
      profiles: profile || { username: "unknown", avatar_url: null },
      prompt_ratings: rating || null
    };
  };

  const userPrompts = (promptsRes.data || []).map(transformPrompt);

  const savedPrompts = (savedRes.data || [])
    .map((item) => item.prompts)
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map(transformPrompt);

  const stats = {
    promptCount: userPrompts.length,
    totalViews: (statsPromptsRes.data || []).reduce((sum, p) => sum + (p.view_count || 0), 0),
    totalCopies: (statsPromptsRes.data || []).reduce((sum, p) => sum + (p.copy_count || 0), 0),
    savedCount: statsSavedRes.count || 0
  };

  return {
    profile,
    userPrompts,
    savedPrompts,
    stats
  };
}

export default function Profile() {
  const { profile, userPrompts, savedPrompts, stats } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultTab = searchParams.get("tab") || "prompts";

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p>{m.profile_notFound()}</p>
      </div>
    );
  }
  return (
    <div className="py-8">
      <Container>
        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-[var(--muted-foreground)]">
                  @{profile.username}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="hidden xs:inline-flex">
                  <Link to={localizeHref("/settings")}>
                    <Edit className="mr-2 h-4 w-4" />
                    {m.profile_editProfile()}
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="xs:hidden" asChild>
                  <Link to={localizeHref("/settings")}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <Link to={localizeHref("/settings")}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            {profile.bio && (
              <p className="mt-4 max-w-lg text-[var(--muted-foreground)]">
                {profile.bio}
              </p>
            )}
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {m.profile_memberSince({ date: new Date(profile.created_at).toLocaleDateString() })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.promptCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{m.profile_prompts()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.savedCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{m.common_saved()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalViews}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {m.profile_totalViews()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalCopies}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{m.profile_totalCopies()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="prompts" className="gap-2">
              <Grid className="h-4 w-4" />
              {m.profile_myPrompts()}
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              {m.common_saved()}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-6">
            {userPrompts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userPrompts.map((prompt) => (
                  <Link key={prompt.id} to={localizeHref(`/prompts/${prompt.id}`)}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold line-clamp-1">
                            {prompt.title}
                          </h3>
                          {!prompt.is_public && (
                            <Badge variant="outline" className="text-xs">
                              {m.profile_private()}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {prompt.description || m.profile_noDescription()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prompt.categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getCategoryDisplayName(cat)}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex items-center gap-2">
                          <StarRating
                            value={prompt.prompt_ratings?.average_rating || 0}
                            readonly
                            size="sm"
                          />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            ({prompt.prompt_ratings?.rating_count || 0})
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
                <p className="text-[var(--muted-foreground)]">
                  {m.profile_noPrompts()}
                </p>
                <Button className="mt-4" asChild>
                  <Link to={localizeHref("/prompts/new")}>{m.profile_createFirst()}</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {savedPrompts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedPrompts.map((prompt) => (
                  <Link key={prompt.id} to={localizeHref(`/prompts/${prompt.id}`)}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <h3 className="font-semibold line-clamp-1">
                          {prompt.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {prompt.description || m.profile_noDescription()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prompt.categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getCategoryDisplayName(cat)}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={prompt.prompt_ratings?.average_rating || 0}
                              readonly
                              size="sm"
                            />
                            <span className="text-xs text-[var(--muted-foreground)]">
                              ({prompt.prompt_ratings?.rating_count || 0})
                            </span>
                          </div>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            @{prompt.profiles?.username}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
                <p className="text-[var(--muted-foreground)]">
                  {m.profile_noSaved()}
                </p>
                <Button className="mt-4" asChild>
                  <Link to={localizeHref("/")}>{m.profile_explorePrompts()}</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
