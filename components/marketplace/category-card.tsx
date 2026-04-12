"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  color?: string;
}

interface CategoryCardProps {
  category: Category;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function CategoryCard({
  category,
  variant = "default",
  className,
}: CategoryCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/category/${category.slug}`}
        className={cn(
          "group flex flex-col items-center gap-2 text-center",
          className
        )}
      >
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-secondary shadow-soft transition-all duration-300 group-hover:shadow-soft-lg group-hover:scale-105">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-xs font-medium text-foreground line-clamp-2">
          {category.name}
        </span>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/category/${category.slug}`}
        className={cn(
          "group relative flex h-48 flex-col justify-end overflow-hidden rounded-3xl bg-secondary p-5 lg:h-64",
          className
        )}
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="relative z-10">
          <h3 className="font-display text-xl font-semibold text-background lg:text-2xl">
            {category.name}
          </h3>
          {category.productCount && (
            <p className="mt-1 text-sm text-background/80">
              {category.productCount.toLocaleString()} products
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl bg-secondary p-4 shadow-soft transition-all duration-300 hover:shadow-soft-lg lg:h-40",
        className
      )}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
      <div className="relative z-10">
        <h3 className="font-medium text-background lg:text-lg">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
