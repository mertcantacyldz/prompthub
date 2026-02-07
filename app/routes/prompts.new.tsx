import { useNavigate, Form, useActionData, useNavigation, redirect, data } from "react-router";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { CATEGORIES, AI_PLATFORMS, INPUT_MODALITIES } from "~/lib/utils/constants";
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabaseServerClient } from "~/lib/supabase";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { InputModality, Prompt, PromptInsert } from "~/types";
import type { Route } from "./+types/prompts.new";

export function meta() {
  return [
    { title: "Create New Prompt - PromptHub" },
    { name: "description", content: "Create and share a new AI prompt" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login?redirectTo=/prompts/new");
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const formData = await request.formData();
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

  const { data: newPrompt, error } = await supabase
    .from("prompts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      prompt_text: prompt_text.trim(),
      categories,
      ai_platforms,
      input_modality,
      is_public,
    } as PromptInsert)
    .select()
    .single();

  if (error) {
    return data({ error: "Failed to create prompt. Please try again." }, { status: 500, headers });
  }

  return redirect(`/prompts/${newPrompt?.id}`, { headers });
}

export default function NewPrompt() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "create_prompt";

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

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="py-8">
      <Container className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="create_prompt" />
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
                  placeholder="Enter a descriptive title for your prompt"
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
                  placeholder="Briefly describe what this prompt does and when to use it"
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
                  placeholder="Enter your prompt here..."
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
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Prompt"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
