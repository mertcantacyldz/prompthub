import { Link, useNavigate, useSearchParams } from "react-router";
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
import { getUserPrompts, getSavedPrompts, getUserStats } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { PromptWithDetails } from "~/types";

export function meta() {
  return [
    { title: "My Profile - PromptHub" },
    { name: "description", content: "View and manage your profile" },
  ];
}

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [userPrompts, setUserPrompts] = useState<PromptWithDetails[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<PromptWithDetails[]>([]);
  const [stats, setStats] = useState({ promptCount: 0, totalViews: 0, totalCopies: 0, savedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const defaultTab = searchParams.get("tab") || "prompts";

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login required",
        description: "Please log in to view your profile.",
        variant: "destructive",
      });
      navigate("/auth/login");
    }
  }, [user, authLoading, navigate, toast]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const [prompts, saved, userStats] = await Promise.all([
          getUserPrompts(user.id, true), // Include private prompts
          getSavedPrompts(user.id),
          getUserStats(user.id),
        ]);

        setUserPrompts(prompts);
        setSavedPrompts(saved);
        setStats(userStats);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
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
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <Link to="/settings">
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
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.promptCount}</p>
              )}
              <p className="text-sm text-[var(--muted-foreground)]">Prompts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.savedCount}</p>
              )}
              <p className="text-sm text-[var(--muted-foreground)]">Saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              )}
              <p className="text-sm text-[var(--muted-foreground)]">
                Total Views
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.totalCopies}</p>
              )}
              <p className="text-sm text-[var(--muted-foreground)]">Total Copies</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="prompts" className="gap-2">
              <Grid className="h-4 w-4" />
              My Prompts
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-4 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : userPrompts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userPrompts.map((prompt) => (
                  <Link key={prompt.id} to={`/prompts/${prompt.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold line-clamp-1">
                            {prompt.title}
                          </h3>
                          {!prompt.is_public && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {prompt.description || "No description"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prompt.categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {cat}
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
                  You haven't created any prompts yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/prompts/new">Create Your First Prompt</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-4 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : savedPrompts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedPrompts.map((prompt) => (
                  <Link key={prompt.id} to={`/prompts/${prompt.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <h3 className="font-semibold line-clamp-1">
                          {prompt.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {prompt.description || "No description"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prompt.categories.slice(0, 2).map((cat) => (
                            <Badge
                              key={cat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {cat}
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
                  You haven't saved any prompts yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/">Explore Prompts</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
