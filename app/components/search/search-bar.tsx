import { useSearchParams, useNavigate } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "~/hooks";
import { cn } from "~/lib/utils";
import * as m from "~/paraglide/messages.js";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SearchBar({
  placeholder,
  className,
  autoFocus = false,
  size = "md",
}: SearchBarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (debouncedQuery !== currentQ) {
      const params = new URLSearchParams(searchParams);
      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      } else {
        params.delete("q");
      }
      params.delete("page"); // Reset pagination ONLY when search query changes
      navigate(`?${params.toString()}`, { replace: true });
    }
  }, [debouncedQuery, navigate, searchParams]);

  const handleClear = () => {
    setQuery("");
  };

  const sizeClasses = {
    sm: "h-9",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <Input
        type="search"
        placeholder={placeholder ?? m.common_searchPrompts()}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        className={cn(
          sizeClasses[size],
          "pl-10 pr-10",
          size === "lg" && "text-base"
        )}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
