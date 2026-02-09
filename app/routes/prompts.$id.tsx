import { Link, useNavigate, useLoaderData } from "react-router";
import type { Route } from "./+types/prompts.$id";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { StarRating } from "~/components/custom";
import { Copy, Bookmark, Check, ArrowLeft, Edit, Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { incrementViewCount, incrementCopyCount } from "~/lib/api";
import { toggleSavePrompt, ratePrompt } from "~/lib/api";
import { getCategoryDisplayName } from "~/lib/utils/i18n-helpers";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import { getSupabaseServerClient } from "~/lib/supabase";
import { localizeHref } from "~/paraglide/runtime.js";
import * as m from "~/paraglide/messages.js";
import type { Prompt, PromptWithDetails } from "~/types";

export function meta({ data }: Route.MetaArgs) {
  const prompt = data?.prompt;
  return [
    { title: prompt ? `${prompt.title} - Promptopia` : `${m.prompt_detail_metaTitle()} - Promptopia` },
    { name: "description", content: prompt?.description || m.prompt_detail_metaDesc() },
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
  const [isSaving, setIsSaving] = useState(false);
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
        title: m.home_loginRequired(),
        description: m.prompt_detail_loginToRate(),
        variant: "destructive",
      });
      navigate(localizeHref(`/auth/login?redirectTo=/prompts/${prompt.id}`));
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await toggleSavePrompt(user.id, prompt.id);
      setSaved(result);
      toast({
        title: result ? m.home_promptSaved() : m.home_promptRemoved(),
        description: result
          ? m.home_addedToSaved()
          : m.home_removedFromSaved(),
      });
    } catch (error) {
      console.error("[PromptDetail] Save failed:", error);
      toast({
        title: m.common_error(),
        description: m.toast_saveFailed(),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: m.home_loginRequired(),
        description: m.prompt_detail_loginToRate(),
        variant: "destructive",
      });
      navigate(localizeHref(`/auth/login?redirectTo=/prompts/${prompt.id}`));
      return;
    }

    setIsRating(true);
    try {
      await ratePrompt(user.id, prompt.id, rating);
      setUserRating(rating);
      toast({
        title: m.toast_ratingSubmitted(),
        description: m.toast_ratingSubmittedDesc({ rating: String(rating) }),
      });
    } catch (error) {
      toast({
        title: m.common_error(),
        description: m.toast_ratingFailed(),
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
          to={localizeHref("/")}
          className="mb-6 inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {m.prompt_backToPrompts()}
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
                  disabled={isSaving}
                  className={saved ? "text-accent-500" : ""}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bookmark
                      className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                    />
                  )}
                </Button>
                {isOwner && (
                  <Button variant="outline" size="icon" asChild>
                    <Link to={localizeHref(`/prompts/${params.id}/edit`)}>
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
                  to={localizeHref(`/profile/${prompt.profiles?.username}`)}
                  className="font-medium hover:text-accent-500"
                >
                  @{prompt.profiles?.username}
                </Link>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <p>
                    {m.prompt_detail_createdOn({ date: new Date(prompt.created_at).toLocaleDateString() })}
                  </p>
                  <div className="flex items-center gap-3 border-l pl-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{prompt.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      <span>{prompt.copy_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories & Platforms */}
            <div className="flex flex-wrap gap-2">
              {prompt.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {getCategoryDisplayName(cat)}
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
                  {averageRating.toFixed(1)} ({m.prompt_detail_ratings({ count: ratingCount })})
                </span>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Description */}
            {prompt.description && (
              <div className="mt-2">
                <h2 className="mb-2 text-lg font-semibold">{m.prompt_detail_description()}</h2>
                <p className="text-[var(--muted-foreground)]">
                  {prompt.description}
                </p>
              </div>
            )}

            {/* Prompt Text */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{m.prompt_detail_prompt()}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      {m.prompt_detail_copied()}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {m.prompt_detail_copy()}
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
              <h3 className="mb-3 font-semibold">{m.prompt_detail_rateThis()}</h3>
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
                    {m.prompt_detail_youRated({ rating: userRating })}
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
