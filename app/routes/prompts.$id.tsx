import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/prompts.$id";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { StarRating } from "~/components/custom";
import { Copy, Bookmark, Check, ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getPromptById, incrementViewCount, incrementCopyCount } from "~/lib/api";
import { toggleSavePrompt, isPromptSaved } from "~/lib/api";
import { ratePrompt, getUserRating } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { PromptWithDetails } from "~/types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Prompt Detail - PromptHub" },
    { name: "description", content: "View prompt details" },
  ];
}

export default function PromptDetail({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState<PromptWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  // Fetch prompt data
  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoading(true);
      try {
        const data = await getPromptById(params.id);
        if (!data) {
          toast({
            title: "Not found",
            description: "This prompt doesn't exist.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        setPrompt(data);

        // Increment view count
        incrementViewCount(params.id).catch(console.error);
      } catch (error) {
        console.error("Error fetching prompt:", error);
        toast({
          title: "Error",
          description: "Failed to load prompt.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [params.id, navigate, toast]);

  // Check saved status and user rating
  useEffect(() => {
    const checkUserData = async () => {
      if (!user || !prompt) return;

      try {
        const [isSaved, rating] = await Promise.all([
          isPromptSaved(user.id, prompt.id),
          getUserRating(user.id, prompt.id),
        ]);
        setSaved(isSaved);
        if (rating) setUserRating(rating.score);
      } catch (error) {
        console.error("Error checking user data:", error);
      }
    };

    checkUserData();
  }, [user, prompt]);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    incrementCopyCount(prompt.id).catch(console.error);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save prompts.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (!prompt) return;

    try {
      const isSaved = await toggleSavePrompt(user.id, prompt.id);
      setSaved(isSaved);
      toast({
        title: isSaved ? "Prompt saved" : "Prompt removed",
        description: isSaved
          ? "Added to your saved prompts."
          : "Removed from your saved prompts.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt.",
        variant: "destructive",
      });
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to rate prompts.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (!prompt) return;

    setIsRating(true);
    try {
      await ratePrompt(user.id, prompt.id, rating);
      setUserRating(rating);
      toast({
        title: "Rating submitted",
        description: `You rated this prompt ${rating} stars.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating.",
        variant: "destructive",
      });
    } finally {
      setIsRating(false);
    }
  };

  const isOwner = user && prompt && user.id === prompt.user_id;

  if (isLoading) {
    return (
      <div className="py-8">
        <Container className="max-w-4xl">
          <Skeleton className="h-6 w-32 mb-6" />
          <Card>
            <CardHeader className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!prompt) {
    return null;
  }

  const averageRating = prompt.prompt_ratings?.average_rating || 0;
  const ratingCount = prompt.prompt_ratings?.rating_count || 0;

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
              <h1 className="text-2xl font-bold">{prompt.title}</h1>
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
                {isOwner && (
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/prompts/${params.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={prompt.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {prompt.profiles?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/profile/${prompt.profiles?.username}`}
                  className="font-medium hover:text-accent-500"
                >
                  @{prompt.profiles?.username}
                </Link>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Created on {new Date(prompt.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Categories & Platforms */}
            <div className="flex flex-wrap gap-2">
              {prompt.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
              {prompt.ai_platforms.map((platform) => (
                <Badge key={platform} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating
                  value={averageRating}
                  readonly
                  size="md"
                />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {averageRating.toFixed(1)} ({ratingCount} ratings)
                </span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Description */}
            {prompt.description && (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Description</h2>
                <p className="text-[var(--muted-foreground)]">
                  {prompt.description}
                </p>
              </div>
            )}

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
                  {prompt.prompt_text}
                </pre>
              </div>
            </div>

            {/* Rate This Prompt */}
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="mb-3 font-semibold">Rate this prompt</h3>
              <div className="flex items-center gap-4">
                {isRating ? (
                  <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
                ) : (
                  <StarRating
                    value={userRating}
                    onChange={handleRating}
                    size="lg"
                  />
                )}
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
