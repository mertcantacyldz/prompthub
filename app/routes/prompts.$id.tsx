import { Link, useNavigate, useLoaderData } from "react-router";
import type { Route } from "./+types/prompts.$id";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { StarRating } from "~/components/custom";
import { Copy, Bookmark, Check, ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { incrementViewCount, incrementCopyCount } from "~/lib/api";
import { toggleSavePrompt, ratePrompt } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { getSupabaseServerClient } from "~/lib/supabase";
import type { Prompt, PromptWithDetails } from "~/types";

export function meta({ data }: Route.MetaArgs) {
  const prompt = data?.prompt;
  return [
    { title: prompt ? `${prompt.title} - PromptHub` : "Prompt Detail - PromptHub" },
    { name: "description", content: prompt?.description || "View prompt details on PromptHub" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const { data: prompt, error } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      ),
      prompt_ratings (
        average_rating,
        rating_count
      )
    `)
    .match({ id: params.id! })
    .single();

  if (error || !prompt) {
    if (error) {
      console.error(`Loader error fetching prompt ID ${params.id}:`, error);
    } else {
      console.warn(`Prompt with ID ${params.id} not found.`);
    }
    throw new Response("Not Found", { status: 404 });
  }

  let isSaved = false;
  let userRating = 0;

  if (userId) {
    const [savedRes, ratingRes] = await Promise.all([
      supabase.from("saved_prompts").select("id").eq("user_id", userId).eq("prompt_id", params.id as string).single(),
      supabase.from("ratings").select("score").eq("user_id", userId).eq("prompt_id", params.id as string).single(),
    ]);

    isSaved = !!savedRes.data;
    userRating = (ratingRes.data as { score: number } | null)?.score || 0;
  }

  // Increment view count (fire and forget on server)
  try {
    const { error: rpcError } = await supabase.rpc('increment_view_count', { prompt_id: params.id! });
    if (rpcError) console.error("Error incrementing view count:", rpcError);
  } catch (err) {
    console.error("RPC error:", err);
  }

  const promptRating = Array.isArray(prompt.prompt_ratings) ? prompt.prompt_ratings[0] : prompt.prompt_ratings;
  const promptProfile = Array.isArray(prompt.profiles) ? prompt.profiles[0] : prompt.profiles;

  return {
    prompt: {
      ...(prompt as unknown as Prompt),
      profiles: promptProfile || { id: "", username: "unknown", display_name: null, avatar_url: null },
      prompt_ratings: promptRating || null
    } as PromptWithDetails,
    initialIsSaved: isSaved,
    initialUserRating: userRating
  };
}

export default function PromptDetail({ params }: Route.ComponentProps) {
  const { prompt, initialIsSaved, initialUserRating } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(initialIsSaved);
  const [userRating, setUserRating] = useState(initialUserRating);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    setSaved(initialIsSaved);
    setUserRating(initialUserRating);
  }, [initialIsSaved, initialUserRating]);

  const handleCopy = async () => {
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
      navigate(`/auth/login?redirectTo=/prompts/${prompt.id}`);
      return;
    }

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
      navigate(`/auth/login?redirectTo=/prompts/${prompt.id}`);
      return;
    }

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

  const isOwner = user && user.id === prompt.user_id;
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
