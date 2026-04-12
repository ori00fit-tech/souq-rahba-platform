"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
} from "lucide-react";
import { MobileHeader } from "@/components/marketplace/mobile-header";
import { BottomNavigation } from "@/components/marketplace/bottom-navigation";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SearchFilters } from "@/components/marketplace/search-filters";
import { ProductCard, type Product } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Pure Moroccan Argan Oil - Cold Pressed Organic",
    slug: "pure-moroccan-argan-oil",
    price: 249,
    originalPrice: 349,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 2340,
    seller: { name: "Argan Essence", isVerified: true },
    badges: ["bestseller"],
    freeShipping: true,
  },
  {
    id: "2",
    name: "Handwoven Berber Wool Rug - Traditional Pattern",
    slug: "handwoven-berber-rug",
    price: 1890,
    originalPrice: 2490,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 892,
    seller: { name: "Atlas Crafts", isVerified: true },
    badges: ["bestseller"],
    freeShipping: true,
  },
  {
    id: "3",
    name: "Moroccan Leather Pouf - Natural Tan",
    slug: "moroccan-leather-pouf",
    price: 650,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 456,
    seller: { name: "Fes Leather", isVerified: true },
    badges: ["new"],
    freeShipping: false,
  },
  {
    id: "4",
    name: "Premium Saffron Threads - Grade A",
    slug: "premium-saffron-threads",
    price: 189,
    originalPrice: 249,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 1205,
    seller: { name: "Taliouine Gold", isVerified: true },
    badges: ["sale"],
    freeShipping: true,
  },
  {
    id: "5",
    name: "Hand-painted Ceramic Tagine - Blue Fes",
    slug: "ceramic-tagine-blue",
    price: 420,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 328,
    seller: { name: "Fes Pottery", isVerified: true },
    freeShipping: false,
  },
  {
    id: "6",
    name: "Brass Moroccan Lantern - Large",
    slug: "brass-moroccan-lantern",
    price: 780,
    originalPrice: 950,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 567,
    seller: { name: "Marrakech Lights", isVerified: true },
    badges: ["sale"],
    freeShipping: true,
  },
  {
    id: "7",
    name: "Berber Silver Bracelet - Handcrafted",
    slug: "berber-silver-bracelet",
    price: 320,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 189,
    seller: { name: "Atlas Silver", isVerified: true },
    badges: ["new"],
    freeShipping: false,
  },
  {
    id: "8",
    name: "Organic Rose Water - Damascus Rose",
    slug: "organic-rose-water",
    price: 89,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 2100,
    seller: { name: "Valley of Roses", isVerified: true },
    badges: ["bestseller", "express"],
    freeShipping: true,
  },
];

const sortOptions = [
  { id: "relevance", label: "Most Relevant" },
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest First" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "price_high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  const activeFilterCount = Object.values(activeFilters).flat().length;
  const currentSort = sortOptions.find((s) => s.id === sortBy);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader cartItemCount={3} />

      <main className="pb-20 lg:pb-8">
        {/* Search Header */}
        <div className="border-b border-border/50 bg-secondary/30 px-4 py-4 lg:px-6 lg:py-6">
          <div className="mx-auto max-w-7xl">
            <SearchBar variant="page" autoFocus={!query} />

            {query && (
              <div className="mt-4">
                <h1 className="text-lg font-semibold text-foreground lg:text-xl">
                  Results for &ldquo;{query}&rdquo;
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mockProducts.length.toLocaleString()} products found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="sticky top-14 z-30 border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur-lg lg:top-16 lg:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            {/* Left: Filters Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Active Filters Pills */}
              {activeFilterCount > 0 && (
                <div className="hidden items-center gap-2 lg:flex">
                  {Object.entries(activeFilters).map(([key, values]) =>
                    values.map((value) => (
                      <Badge
                        key={`${key}-${value}`}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {value}
                        <button
                          onClick={() => {
                            setActiveFilters((prev) => ({
                              ...prev,
                              [key]: prev[key].filter((v) => v !== value),
                            }));
                          }}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                  <button
                    onClick={() => setActiveFilters({})}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Right: Sort & View */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span className="hidden sm:inline">Sort by:</span>
                  <span className="font-medium">{currentSort?.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isSortOpen && "rotate-180"
                    )}
                  />
                </Button>

                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border/50 bg-card shadow-premium">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id);
                            setIsSortOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-secondary",
                            sortBy === option.id &&
                              "bg-primary/5 font-medium text-primary"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden rounded-lg border border-border/50 p-1 lg:flex">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden w-64 shrink-0 lg:block">
              <SearchFilters
                isOpen={true}
                onClose={() => {}}
                onApply={setActiveFilters}
                activeFilters={activeFilters}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
                  {mockProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {mockProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="horizontal"
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg">
                  Load More Products
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        <SearchFilters
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onApply={setActiveFilters}
          activeFilters={activeFilters}
        />
      </main>

      <BottomNavigation />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchContent />
    </Suspense>
  );
}
