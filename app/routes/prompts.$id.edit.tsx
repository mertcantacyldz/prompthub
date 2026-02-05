import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/prompts.$id.edit";
import { Container } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
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
import { getPromptById, updatePrompt, deletePrompt } from "~/lib/api";
import { useAuth } from "~/context";
import { useToast } from "~/hooks/use-toast";
import type { PromptWithDetails, InputModality } from "~/types";

export function meta() {
  return [
    { title: "Edit Prompt - PromptHub" },
    { name: "description", content: "Edit your prompt" },
  ];
}

export default function EditPrompt({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState<PromptWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [inputModality, setInputModality] = useState<InputModality>("text");
  const [isPublic, setIsPublic] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

        // Check ownership
        if (user && data.user_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own prompts.",
            variant: "destructive",
          });
          navigate(`/prompts/${params.id}`);
          return;
        }

        setPrompt(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setPromptText(data.prompt_text);
        setSelectedCategories(data.categories);
        setSelectedPlatforms(data.ai_platforms);
        setInputModality(data.input_modality);
        setIsPublic(data.is_public);
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

    if (!authLoading) {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to edit prompts.",
          variant: "destructive",
        });
        navigate("/auth/login");
      } else {
        fetchPrompt();
      }
    }
  }, [params.id, user, authLoading, navigate, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) return;

    // Validation
    if (!title.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a title.",
        variant: "destructive",
      });
      return;
    }

    if (!promptText.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter the prompt text.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Validation error",
        description: "Please select at least one category.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Validation error",
        description: "Please select at least one AI platform.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePrompt(prompt.id, {
        title: title.trim(),
        description: description.trim() || null,
        prompt_text: promptText.trim(),
        categories: selectedCategories,
        ai_platforms: selectedPlatforms,
        input_modality: inputModality,
        is_public: isPublic,
      });

      toast({
        title: "Prompt updated!",
        description: "Your changes have been saved.",
      });

      navigate(`/prompts/${prompt.id}`);
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;

    setIsDeleting(true);

    try {
      await deletePrompt(prompt.id);

      toast({
        title: "Prompt deleted",
        description: "Your prompt has been permanently deleted.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="py-8">
        <Container className="max-w-3xl">
          <Skeleton className="h-6 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
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
                <Button variant="destructive" size="sm" disabled={isSubmitting}>
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
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <Label htmlFor="prompt_text">Prompt Text *</Label>
                <Textarea
                  id="prompt_text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
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
                  value={inputModality}
                  onChange={(e) => setInputModality(e.target.value as InputModality)}
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                  <Link to={`/prompts/${params.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
