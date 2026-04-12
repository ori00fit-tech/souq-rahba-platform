"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Truck, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  image: string;
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    isVerified: boolean;
  };
  badges?: Array<"bestseller" | "new" | "sale" | "express">;
  freeShipping?: boolean;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  className,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  if (variant === "horizontal") {
    return (
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "group flex gap-4 rounded-2xl border border-border/50 bg-card p-3 shadow-soft transition-all duration-300 hover:shadow-soft-lg",
          className
        )}
      >
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {product.seller.name}
              {product.seller.isVerified && (
                <ShieldCheck className="ml-1 inline-block h-3 w-3 text-trust" />
              )}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-base font-semibold text-foreground">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-300",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-2 px-0.5">
          <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft card-hover",
        className
      )}
    >
      {/* Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-secondary"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badges?.includes("bestseller") && (
            <Badge variant="accent" className="text-2xs">
              Bestseller
            </Badge>
          )}
          {product.badges?.includes("new") && (
            <Badge variant="default" className="text-2xs">
              New
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="text-2xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Quick Add */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 h-9 w-9 rounded-full opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            // Add to cart logic
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Quick add</span>
        </Button>
      </Link>

      {/* Wishlist Button */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background",
          isWishlisted && "text-destructive"
        )}
        onClick={() => setIsWishlisted(!isWishlisted)}
      >
        <Heart
          className={cn("h-4 w-4", isWishlisted && "fill-current")}
        />
        <span className="sr-only">
          {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        </span>
      </Button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 lg:p-4">
        {/* Seller */}
        <div className="mb-1.5 flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {product.seller.name}
          </span>
          {product.seller.isVerified && (
            <ShieldCheck className="h-3 w-3 text-trust" />
          )}
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary lg:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground lg:text-xl">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>

          {/* Delivery Info */}
          <div className="mt-2 flex items-center gap-3">
            {product.freeShipping && (
              <div className="flex items-center gap-1 text-xs text-accent">
                <Truck className="h-3 w-3" />
                <span>Free Shipping</span>
              </div>
            )}
            {product.badges?.includes("express") && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <Truck className="h-3 w-3" />
                <span>Express</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
