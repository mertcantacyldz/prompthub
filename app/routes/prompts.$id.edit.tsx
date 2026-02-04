import { Link } from "react-router";
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
import { X, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function meta() {
  return [
    { title: "Edit Prompt - PromptHub" },
    { name: "description", content: "Edit your prompt" },
  ];
}

// Mock data - will be replaced with actual data from Supabase
const MOCK_PROMPT = {
  id: "1",
  title: "Professional Email Writer",
  description:
    "Generate professional emails for any business context with proper tone and formatting.",
  prompt_text: `You are an expert professional email writer...`,
  categories: ["Writing/Content", "Business"],
  ai_platforms: ["ChatGPT", "Claude"],
  input_modality: "text",
  is_public: true,
};

export default function EditPrompt({ params }: Route.ComponentProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    MOCK_PROMPT.categories
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    MOCK_PROMPT.ai_platforms
  );
  const [isPublic, setIsPublic] = useState(MOCK_PROMPT.is_public);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
                <Button variant="destructive" size="sm">
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
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  defaultValue={MOCK_PROMPT.title}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={MOCK_PROMPT.description}
                  rows={3}
                />
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <Label htmlFor="prompt_text">Prompt Text *</Label>
                <Textarea
                  id="prompt_text"
                  defaultValue={MOCK_PROMPT.prompt_text}
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
                  defaultValue={MOCK_PROMPT.input_modality}
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
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" asChild>
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
