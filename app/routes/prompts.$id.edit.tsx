import { Link, useNavigate, Form, useActionData, useNavigation, useLoaderData, redirect, data } from "react-router";
import type { Route } from "./+types/prompts.$id.edit";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { CATEGORIES, AI_PLATFORMS, INPUT_MODALITIES } from "~/lib/utils/constants";
import { X, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getSupabaseServerClient } from "~/lib/supabase";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { Prompt, PromptUpdate, PromptWithDetails, InputModality } from "~/types";

export function meta() {
  return [
    { title: "Edit Prompt - PromptHub" },
    { name: "description", content: "Edit your prompt" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(`/auth/login?redirectTo=/prompts/${params.id}/edit`);
  }

  const { data: prompt, error } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("id", params.id!)
    .single();

  if (error || !prompt) {
    return redirect("/?error=prompt_not_found");
  }

  // Check ownership
  if (prompt.user_id !== user.id) {
    return redirect(`/prompts/${params.id}?error=unauthorized`);
  }

  const promptProfile = Array.isArray(prompt.profiles) ? prompt.profiles[0] : prompt.profiles;

  return {
    prompt: {
      ...(prompt as unknown as Prompt),
      profiles: promptProfile || { id: "", username: "unknown", display_name: null, avatar_url: null },
      prompt_ratings: null // Ratings view not joined here in select
    } as PromptWithDetails
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete_prompt") {
    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", params.id!)
      .eq("user_id", user.id);

    if (error) {
      return data({ error: "Failed to delete prompt." }, { status: 500, headers });
    }

    return redirect("/", { headers });
  }

  if (intent === "edit_prompt") {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const prompt_text = formData.get("prompt_text") as string;
    const categories = formData.getAll("categories") as string[];
    const ai_platforms = formData.getAll("ai_platforms") as string[];
    const input_modality = formData.get("input_modality") as InputModality;
    const is_public = formData.get("is_public") === "true";

    // Validation
    if (title.trim().length < 3) {
      return data({ error: "Title must be at least 3 characters long." }, { status: 400 });
    }
    if (prompt_text.trim().length < 10) {
      return data({ error: "Prompt text must be at least 10 characters long." }, { status: 400 });
    }
    if (categories.length === 0) {
      return data({ error: "Please select at least one category." }, { status: 400 });
    }
    if (ai_platforms.length === 0) {
      return data({ error: "Please select at least one AI platform." }, { status: 400 });
    }

    const { error } = await supabase
      .from("prompts")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        prompt_text: prompt_text.trim(),
        categories,
        ai_platforms,
        input_modality,
        is_public,
        updated_at: new Date().toISOString(),
      } as PromptUpdate)
      .eq("id", params.id!)
      .eq("user_id", user.id);

    if (error) {
      return data({ error: "Failed to update prompt." }, { status: 500, headers });
    }

    return redirect(`/prompts/${params.id}`, { headers });
  }

  return null;
}

export default function EditPrompt({ params }: Route.ComponentProps) {
  const { prompt } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(prompt.categories);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(prompt.ai_platforms);
  const [isPublic, setIsPublic] = useState(prompt.is_public);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "edit_prompt";
  const isDeleting = navigation.state === "submitting" && navigation.formData?.get("intent") === "delete_prompt";

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData, toast]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="py-8">
      <Container className="max-w-3xl">
        {/* Back Button */}
        <Link
          to={`/prompts/${params.id}`}
          className="mb-6 inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to prompt
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Edit Prompt</CardTitle>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSubmitting || isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Prompt</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this prompt? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete_prompt" />
                    <Button variant="destructive" type="submit" disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </Form>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="edit_prompt" />
              <input type="hidden" name="is_public" value={String(isPublic)} />
              {selectedCategories.map(c => (
                <input key={c} type="hidden" name="categories" value={c} />
              ))}
              {selectedPlatforms.map(p => (
                <input key={p} type="hidden" name="ai_platforms" value={p} />
              ))}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={prompt.title}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={prompt.description || ""}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <Label htmlFor="prompt_text">Prompt Text *</Label>
                <Textarea
                  id="prompt_text"
                  name="prompt_text"
                  defaultValue={prompt.prompt_text}
                  disabled={isSubmitting}
                  rows={8}
                  required
                  className="font-mono text-sm"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories * (select at least one)</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        selectedCategories.includes(category)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                      {selectedCategories.includes(category) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Platforms */}
              <div className="space-y-2">
                <Label>Best AI Platforms * (select at least one)</Label>
                <div className="flex flex-wrap gap-2">
                  {AI_PLATFORMS.map((platform) => (
                    <Badge
                      key={platform}
                      variant={
                        selectedPlatforms.includes(platform)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => togglePlatform(platform)}
                    >
                      {platform}
                      {selectedPlatforms.includes(platform) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Input Modality */}
              <div className="space-y-2">
                <Label htmlFor="input_modality">Input Type</Label>
                <select
                  id="input_modality"
                  name="input_modality"
                  defaultValue={prompt.input_modality}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  {INPUT_MODALITIES.map((modality) => (
                    <option key={modality} value={modality}>
                      {modality.charAt(0).toUpperCase() + modality.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Public/Private */}
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">Make Public</Label>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {isPublic
                      ? "Anyone can see and use this prompt"
                      : "Only you can see this prompt"}
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild disabled={isSubmitting || isDeleting}>
                  <Link to={`/prompts/${params.id}`}>Cancel</Link>
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
