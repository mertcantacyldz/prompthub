import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/profile.$username";
import { Container } from "~/components/layout";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { StarRating } from "~/components/custom";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getProfileByUsername, getUserPrompts, getUserStats } from "~/lib/api";
import { useToast } from "~/hooks/use-toast";
import type { Profile, PromptWithDetails } from "~/types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `@${params.username} - PromptHub` },
    { name: "description", content: `View ${params.username}'s profile` },
  ];
}

export default function UserProfile({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPrompts, setUserPrompts] = useState<PromptWithDetails[]>([]);
  const [stats, setStats] = useState({ promptCount: 0, totalViews: 0, totalCopies: 0, savedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userProfile = await getProfileByUsername(params.username);

        if (!userProfile) {
          toast({
            title: "User not found",
            description: "This user doesn't exist.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setProfile(userProfile);

        const [prompts, userStats] = await Promise.all([
          getUserPrompts(userProfile.id, false), // Only public prompts
          getUserStats(userProfile.id),
        ]);

        setUserPrompts(prompts);
        setStats(userStats);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.username, navigate, toast]);

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 text-center sm:text-left">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="mb-8 grid grid-cols-3 gap-4 sm:max-w-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return null;
  }
  // Calculate average rating
  const avgRating = userPrompts.length > 0
    ? userPrompts.reduce((acc, p) => acc + (p.prompt_ratings?.average_rating || 0), 0) / userPrompts.length
    : 0;

  const totalRatings = userPrompts.reduce((acc, p) => acc + (p.prompt_ratings?.rating_count || 0), 0);

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
            <h1 className="text-2xl font-bold">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              @{profile.username}
            </p>
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
        <div className="mb-8 grid grid-cols-3 gap-4 sm:max-w-md">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.promptCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Prompts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalRatings}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Ratings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Avg</p>
            </CardContent>
          </Card>
        </div>

        {/* User's Prompts */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Prompts by @{profile.username}
          </h2>
          {userPrompts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userPrompts.map((prompt) => (
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
                This user hasn't created any prompts yet.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
