"use client";

import { SearchBar } from "./search-bar";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background pb-8 pt-6 lg:pb-16 lg:pt-12">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        {/* Eyebrow */}
        <div className="mb-4 flex justify-center lg:mb-6">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm">
            Morocco&apos;s Premier Marketplace
          </Badge>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl text-balance">
            Discover Quality,
            <span className="text-primary"> Delivered Fast</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground lg:mt-6 lg:text-lg text-pretty">
            Shop thousands of products from verified Moroccan sellers. Premium quality, trusted service, nationwide delivery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-6 max-w-2xl lg:mt-10">
          <SearchBar variant="hero" />
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:mt-8 lg:gap-3">
          <span className="text-sm text-muted-foreground">Popular:</span>
          {["Argan Oil", "Moroccan Rugs", "Leather Goods", "Saffron", "Ceramics"].map((term) => (
            <a
              key={term}
              href={`/search?q=${encodeURIComponent(term.toLowerCase())}`}
              className="rounded-full border border-border/50 bg-background px-3 py-1.5 text-sm transition-all hover:border-primary hover:text-primary"
            >
              {term}
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/50 pt-8 lg:mt-14 lg:gap-8 lg:pt-10">
          <div className="text-center">
            <div className="font-display text-2xl font-semibold text-foreground lg:text-4xl">
              50K+
            </div>
            <div className="mt-1 text-xs text-muted-foreground lg:text-sm">
              Products
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-semibold text-foreground lg:text-4xl">
              2K+
            </div>
            <div className="mt-1 text-xs text-muted-foreground lg:text-sm">
              Verified Sellers
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-semibold text-foreground lg:text-4xl">
              100K+
            </div>
            <div className="mt-1 text-xs text-muted-foreground lg:text-sm">
              Happy Customers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
