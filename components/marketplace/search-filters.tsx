"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  type: "checkbox" | "range" | "rating";
  options?: FilterOption[];
  range?: { min: number; max: number };
}

const filterSections: FilterSection[] = [
  {
    id: "category",
    title: "Category",
    type: "checkbox",
    options: [
      { id: "beauty", label: "Beauty & Wellness", count: 1240 },
      { id: "home", label: "Home & Decor", count: 890 },
      { id: "fashion", label: "Fashion", count: 2340 },
      { id: "artisan", label: "Artisan Crafts", count: 567 },
      { id: "food", label: "Food & Spices", count: 432 },
    ],
  },
  {
    id: "price",
    title: "Price Range",
    type: "range",
    range: { min: 0, max: 5000 },
  },
  {
    id: "rating",
    title: "Customer Rating",
    type: "rating",
    options: [
      { id: "4+", label: "4 stars & above" },
      { id: "3+", label: "3 stars & above" },
      { id: "2+", label: "2 stars & above" },
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    type: "checkbox",
    options: [
      { id: "free", label: "Free Shipping", count: 3420 },
      { id: "express", label: "Express Delivery", count: 1200 },
    ],
  },
  {
    id: "seller",
    title: "Seller",
    type: "checkbox",
    options: [
      { id: "verified", label: "Verified Sellers Only", count: 4500 },
      { id: "top", label: "Top Rated Sellers", count: 890 },
    ],
  },
];

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string[]>) => void;
  activeFilters: Record<string, string[]>;
}

export function SearchFilters({
  isOpen,
  onClose,
  onApply,
  activeFilters,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "category",
    "price",
    "rating",
  ]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, string[]>>(activeFilters);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleFilter = (sectionId: string, optionId: string) => {
    setLocalFilters((prev) => {
      const current = prev[sectionId] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [sectionId]: updated };
    });
  };

  const clearFilters = () => {
    setLocalFilters({});
    setPriceRange({ min: 0, max: 5000 });
  };

  const activeCount = Object.values(localFilters).flat().length;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Filter Panel */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background shadow-premium transition-transform duration-300 lg:static lg:block lg:max-h-none lg:rounded-2xl lg:shadow-soft",
          isOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        )}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-4 lg:hidden">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-semibold">Filters</span>
            {activeCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5">
                {activeCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 lg:p-5">
          {/* Desktop Header */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <h3 className="font-semibold text-foreground">Filters</h3>
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Sections */}
          <div className="space-y-4">
            {filterSections.map((section) => (
              <div
                key={section.id}
                className="border-b border-border/50 pb-4 last:border-0"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between py-2"
                >
                  <span className="text-sm font-medium">{section.title}</span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.includes(section.id) && (
                  <div className="mt-2 space-y-2">
                    {section.type === "checkbox" &&
                      section.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                              localFilters[section.id]?.includes(option.id)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {localFilters[section.id]?.includes(option.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <span className="flex-1 text-sm">{option.label}</span>
                          {option.count && (
                            <span className="text-xs text-muted-foreground">
                              {option.count.toLocaleString()}
                            </span>
                          )}
                        </label>
                      ))}

                    {section.type === "rating" &&
                      section.options?.map((option) => (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                              localFilters[section.id]?.includes(option.id)
                                ? "border-primary bg-primary"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {localFilters[section.id]?.includes(option.id) && (
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  star <= parseInt(option.id)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                            <span className="ml-1 text-sm text-muted-foreground">
                              & up
                            </span>
                          </div>
                        </label>
                      ))}

                    {section.type === "range" && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-2xs text-muted-foreground">
                              Min
                            </label>
                            <input
                              type="number"
                              value={priceRange.min}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  min: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <span className="mt-5 text-muted-foreground">-</span>
                          <div className="flex-1">
                            <label className="text-2xs text-muted-foreground">
                              Max
                            </label>
                            <input
                              type="number"
                              value={priceRange.max}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  max: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              placeholder="5000"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Price in MAD
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="mt-6 flex gap-3 lg:hidden">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Clear
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onApply(localFilters);
                onClose();
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
