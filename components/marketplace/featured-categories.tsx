"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CategoryCard, type Category } from "./category-card";

const categories: Category[] = [
  {
    id: "1",
    name: "Beauty & Wellness",
    slug: "beauty-wellness",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    productCount: 3420,
  },
  {
    id: "2",
    name: "Home & Decor",
    slug: "home-decor",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=400&fit=crop",
    productCount: 5670,
  },
  {
    id: "3",
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
    productCount: 8920,
  },
  {
    id: "4",
    name: "Artisan Crafts",
    slug: "artisan-crafts",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=400&fit=crop",
    productCount: 2340,
  },
  {
    id: "5",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop",
    productCount: 4560,
  },
  {
    id: "6",
    name: "Food & Spices",
    slug: "food-spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    productCount: 1890,
  },
];

const quickCategories: Category[] = [
  {
    id: "q1",
    name: "Argan Oil",
    slug: "argan-oil",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop",
  },
  {
    id: "q2",
    name: "Rugs",
    slug: "rugs",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=200&h=200&fit=crop",
  },
  {
    id: "q3",
    name: "Leather",
    slug: "leather",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop",
  },
  {
    id: "q4",
    name: "Pottery",
    slug: "pottery",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop",
  },
  {
    id: "q5",
    name: "Textiles",
    slug: "textiles",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop",
  },
  {
    id: "q6",
    name: "Jewelry",
    slug: "jewelry",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",
  },
  {
    id: "q7",
    name: "Spices",
    slug: "spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop",
  },
  {
    id: "q8",
    name: "Lamps",
    slug: "lamps",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Quick Categories - Mobile Scroll */}
        <div className="mb-10 lg:mb-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground lg:text-xl">
              Shop by Category
            </h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-8 lg:gap-6 lg:overflow-visible">
            {quickCategories.map((category) => (
              <div key={category.id} className="shrink-0">
                <CategoryCard category={category} variant="compact" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Categories Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground lg:text-2xl">
              Featured Collections
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
            {categories.slice(0, 2).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                variant="featured"
              />
            ))}
            <div className="col-span-2 lg:col-span-1">
              <CategoryCard
                category={categories[2]}
                variant="featured"
              />
            </div>
            {categories.slice(3).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                variant="default"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
