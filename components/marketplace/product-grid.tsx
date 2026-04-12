"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductCard, type Product } from "./product-card";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: Product[];
  columns?: 2 | 3 | 4;
  variant?: "default" | "scroll";
}

export function ProductGrid({
  title,
  subtitle,
  viewAllHref,
  products,
  columns = 4,
  variant = "default",
}: ProductGridProps) {
  const gridCols = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  if (variant === "scroll") {
    return (
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground lg:text-2xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible">
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[200px] shrink-0 lg:w-auto"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground lg:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div
          className={`grid grid-cols-2 gap-3 ${gridCols[columns]} lg:gap-5`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
