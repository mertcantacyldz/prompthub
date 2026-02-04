import { Link } from "react-router";
import type { Route } from "./+types/prompts.$id";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { StarRating } from "~/components/custom";
import { Copy, Bookmark, Check, ArrowLeft, Edit } from "lucide-react";
import { useState } from "react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Prompt Detail - PromptHub" },
    { name: "description", content: "View prompt details" },
  ];
}

// Mock data - will be replaced with actual data from Supabase
const MOCK_PROMPT = {
  id: "1",
  title: "Professional Email Writer",
  description:
    "Generate professional emails for any business context with proper tone, formatting, and structure. Perfect for business communication, follow-ups, and formal correspondence.",
  prompt_text: `You are an expert professional email writer. I need you to write a professional email based on the following details:

Context: [Describe the situation]
Recipient: [Who is the email for]
Purpose: [What you want to achieve]
Tone: [Formal/Semi-formal/Friendly professional]

Please write a well-structured email that:
1. Has an appropriate subject line
2. Opens with a professional greeting
3. Clearly states the purpose in the first paragraph
4. Provides necessary details in the body
5. Ends with a clear call to action
6. Closes professionally

Additional requirements:
- Keep it concise but complete
- Use appropriate business language
- Ensure proper formatting`,
  categories: ["Writing/Content", "Business"],
  ai_platforms: ["ChatGPT", "Claude"],
  input_modality: "text",
  is_public: true,
  created_at: "2024-01-15",
  average_rating: 4.5,
  rating_count: 128,
  user: {
    id: "user1",
    username: "promptmaster",
    avatar_url: null,
  },
};

export default function PromptDetail({ params }: Route.ComponentProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MOCK_PROMPT.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <div className="py-8">
      <Container className="max-w-4xl">
        {/* Back Button */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to prompts
        </Link>

        <Card>
          <CardHeader className="space-y-4">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{MOCK_PROMPT.title}</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSave}
                  className={saved ? "text-accent-500" : ""}
                >
                  <Bookmark
                    className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/prompts/${params.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={MOCK_PROMPT.user.avatar_url || undefined} />
                <AvatarFallback>
                  {MOCK_PROMPT.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/profile/${MOCK_PROMPT.user.username}`}
                  className="font-medium hover:text-accent-500"
                >
                  @{MOCK_PROMPT.user.username}
                </Link>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Created on {new Date(MOCK_PROMPT.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Categories & Platforms */}
            <div className="flex flex-wrap gap-2">
              {MOCK_PROMPT.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
              {MOCK_PROMPT.ai_platforms.map((platform) => (
                <Badge key={platform} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating
                  value={MOCK_PROMPT.average_rating}
                  readonly
                  size="md"
                />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {MOCK_PROMPT.average_rating.toFixed(1)} ({MOCK_PROMPT.rating_count}{" "}
                  ratings)
                </span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Description */}
            <div>
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="text-[var(--muted-foreground)]">
                {MOCK_PROMPT.description}
              </p>
            </div>

            {/* Prompt Text */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prompt</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="rounded-lg bg-[var(--muted)] p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {MOCK_PROMPT.prompt_text}
                </pre>
              </div>
            </div>

            {/* Rate This Prompt */}
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="mb-3 font-semibold">Rate this prompt</h3>
              <div className="flex items-center gap-4">
                <StarRating
                  value={userRating}
                  onChange={setUserRating}
                  size="lg"
                />
                {userRating > 0 && (
                  <span className="text-sm text-[var(--muted-foreground)]">
                    You rated {userRating} stars
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
