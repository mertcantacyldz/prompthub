import { Link } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StarRating } from "~/components/custom";
import { Edit, Bookmark, Grid, Settings } from "lucide-react";

export function meta() {
  return [
    { title: "My Profile - PromptHub" },
    { name: "description", content: "View and manage your profile" },
  ];
}

// Mock data
const MOCK_USER = {
  id: "user1",
  username: "promptmaster",
  email: "user@example.com",
  display_name: "Prompt Master",
  bio: "AI enthusiast and prompt engineer. Creating useful prompts for everyone.",
  avatar_url: null,
  created_at: "2024-01-01",
};

const MOCK_USER_PROMPTS = [
  {
    id: "1",
    title: "Professional Email Writer",
    description: "Generate professional emails for any business context",
    categories: ["Writing/Content", "Business"],
    average_rating: 4.5,
    rating_count: 128,
  },
  {
    id: "2",
    title: "Code Review Assistant",
    description: "Get detailed code reviews with suggestions",
    categories: ["Programming", "Technology"],
    average_rating: 4.7,
    rating_count: 89,
  },
];

const MOCK_SAVED_PROMPTS = [
  {
    id: "3",
    title: "Midjourney Portrait Generator",
    description: "Create stunning portrait images",
    categories: ["Image Generation", "Design"],
    average_rating: 4.8,
    rating_count: 256,
    user: { username: "aiartist" },
  },
];

export default function Profile() {
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
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {MOCK_USER.display_name || MOCK_USER.username}
                </h1>
                <p className="text-[var(--muted-foreground)]">
                  @{MOCK_USER.username}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/profile/edit">
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
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{MOCK_USER_PROMPTS.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Prompts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{MOCK_SAVED_PROMPTS.length}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {MOCK_USER_PROMPTS.reduce((acc, p) => acc + p.rating_count, 0)}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Total Ratings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">4.6</p>
              <p className="text-sm text-[var(--muted-foreground)]">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prompts">
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
                  You haven't created any prompts yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/prompts/new">Create Your First Prompt</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {MOCK_SAVED_PROMPTS.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_SAVED_PROMPTS.map((prompt) => (
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
                        <div className="flex w-full items-center justify-between">
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
                          <span className="text-xs text-[var(--muted-foreground)]">
                            @{prompt.user.username}
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
