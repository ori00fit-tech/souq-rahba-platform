"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "header" | "page";
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const trendingSearches = [
  "Argan oil",
  "Moroccan rug",
  "Leather bags",
  "Saffron",
  "Ceramics",
];

const recentSearches = ["Babouches", "Tea set", "Wool blanket"];

export function SearchBar({
  variant = "header",
  placeholder = "Search products, brands, categories...",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setIsFocused(false);
  };

  const isHero = variant === "hero";
  const isPage = variant === "page";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center overflow-hidden rounded-2xl border bg-background transition-all duration-200",
            isHero
              ? "h-14 shadow-soft-lg lg:h-16"
              : isPage
              ? "h-12 shadow-soft"
              : "h-11",
            isFocused
              ? "border-primary ring-2 ring-primary/20"
              : "border-border/50 hover:border-border"
          )}
        >
          <div className="flex h-full items-center pl-4 lg:pl-5">
            <Search
              className={cn(
                "text-muted-foreground transition-colors",
                isHero ? "h-5 w-5 lg:h-6 lg:w-6" : "h-4 w-4 lg:h-5 lg:w-5",
                isFocused && "text-primary"
              )}
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={cn(
              "h-full flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-muted-foreground",
              isHero ? "text-base lg:text-lg" : "text-sm lg:text-base"
            )}
          />

          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}

          <Button
            type="submit"
            className={cn(
              "mr-1.5 shrink-0 rounded-xl",
              isHero
                ? "h-10 px-5 lg:h-11 lg:px-6"
                : "h-8 px-4 text-sm lg:h-9"
            )}
          >
            Search
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && !query && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-premium animate-fade-in">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recent Searches
                </span>
                <button className="text-xs text-primary hover:underline">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-secondary/80"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trending Now
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSuggestionClick(term)}
                  className="rounded-full border border-border/50 px-3 py-1.5 text-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
