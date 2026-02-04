import { Link } from "react-router";
import type { Route } from "./+types/profile.$username";
import { Container } from "~/components/layout";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { StarRating } from "~/components/custom";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `@${params.username} - PromptHub` },
    { name: "description", content: `View ${params.username}'s profile` },
  ];
}

// Mock data
const MOCK_USER = {
  id: "user2",
  username: "aiartist",
  display_name: "AI Artist",
  bio: "Creating beautiful AI art and sharing the best prompts.",
  avatar_url: null,
  created_at: "2024-02-01",
};

const MOCK_USER_PROMPTS = [
  {
    id: "2",
    title: "Midjourney Portrait Generator",
    description: "Create stunning portrait images with cinematic lighting",
    categories: ["Image Generation", "Design"],
    average_rating: 4.8,
    rating_count: 256,
  },
  {
    id: "5",
    title: "Landscape Photography Style",
    description: "Generate breathtaking landscape images in various styles",
    categories: ["Image Generation", "Design"],
    average_rating: 4.6,
    rating_count: 142,
  },
];

export default function UserProfile({ params }: Route.ComponentProps) {
  return (
    <div className="py-8">
      <Container>
        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={MOCK_USER.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {MOCK_USER.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {MOCK_USER.display_name || MOCK_USER.username}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              @{MOCK_USER.username}
            </p>
            {MOCK_USER.bio && (
              <p className="mt-4 max-w-lg text-[var(--muted-foreground)]">
                {MOCK_USER.bio}
              </p>
            )}
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Member since {new Date(MOCK_USER.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4 sm:max-w-md">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{MOCK_USER_PROMPTS.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Prompts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {MOCK_USER_PROMPTS.reduce((acc, p) => acc + p.rating_count, 0)}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">Ratings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">4.7</p>
              <p className="text-sm text-[var(--muted-foreground)]">Avg</p>
            </CardContent>
          </Card>
        </div>

        {/* User's Prompts */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Prompts by @{params.username}
          </h2>
          {MOCK_USER_PROMPTS.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_USER_PROMPTS.map((prompt) => (
                <Link key={prompt.id} to={`/prompts/${prompt.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <h3 className="font-semibold line-clamp-1">
                        {prompt.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {prompt.description}
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
                          value={prompt.average_rating}
                          readonly
                          size="sm"
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">
                          ({prompt.rating_count})
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
