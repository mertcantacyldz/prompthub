import { useSearchParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CATEGORIES, AI_PLATFORMS, INPUT_MODALITIES } from "~/lib/utils/constants";
import { getCategoryDisplayName, getModalityDisplayName } from "~/lib/utils/i18n-helpers";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "~/lib/utils";
import * as m from "~/paraglide/messages.js";

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategories = searchParams.getAll("category");
  const selectedPlatforms = searchParams.getAll("platform");
  const selectedModality = searchParams.get("modality");
  const sortBy = searchParams.get("sort") || "newest";

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedModality;

  const updateParams = (key: string, value: string, isArray = false) => {
    const params = new URLSearchParams(searchParams);

    if (isArray) {
      const currentValues = params.getAll(key);
      if (currentValues.includes(value)) {
        params.delete(key);
        currentValues
          .filter((v) => v !== value)
          .forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("page"); // Reset pagination
    navigate(`?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-semibold">{m.common_filters()}</span>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {m.common_clearAll()}
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>{m.filter_sortBy()}</Label>
        <Select value={sortBy} onValueChange={(v) => updateParams("sort", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{m.filter_newest()}</SelectItem>
            <SelectItem value="most_viewed">{m.filter_mostPopular()}</SelectItem>
            <SelectItem value="highest_rated">{m.filter_highestRated()}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label>{m.filter_categories()}</Label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => updateParams("category", category, true)}
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-sm cursor-pointer"
              >
                {getCategoryDisplayName(category)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* AI Platforms */}
      <div className="space-y-3">
        <Label>{m.filter_aiPlatforms()}</Label>
        <div className="space-y-2">
          {AI_PLATFORMS.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={`plat-${platform}`}
                checked={selectedPlatforms.includes(platform)}
                onCheckedChange={() => updateParams("platform", platform, true)}
              />
              <label
                htmlFor={`plat-${platform}`}
                className="text-sm cursor-pointer"
              >
                {platform}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Input Modality */}
      <div className="space-y-3">
        <Label>{m.filter_inputType()}</Label>
        <div className="flex flex-wrap gap-2">
          {INPUT_MODALITIES.map((modality) => (
            <Badge
              key={modality}
              variant={selectedModality === modality ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() =>
                updateParams(
                  "modality",
                  selectedModality === modality ? "" : modality
                )
              }
            >
              {getModalityDisplayName(modality)}
              {selectedModality === modality && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label>{m.filter_activeFilters()}</Label>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => updateParams("category", cat, true)}
                >
                  {getCategoryDisplayName(cat)}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {selectedPlatforms.map((plat) => (
                <Badge
                  key={plat}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => updateParams("platform", plat, true)}
                >
                  {plat}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {selectedModality && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer capitalize"
                  onClick={() => updateParams("modality", "")}
                >
                  {getModalityDisplayName(selectedModality)}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
