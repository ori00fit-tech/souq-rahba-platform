"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { MobileHeader } from "@/components/marketplace/mobile-header";
import { BottomNavigation } from "@/components/marketplace/bottom-navigation";
import { SellerTrustPanel, type Seller } from "@/components/marketplace/seller-trust-panel";
import { ProductCard, type Product } from "@/components/marketplace/product-card";
import { TrustBadge } from "@/components/marketplace/trust-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

const productImages = [
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop&sat=-100",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop&bri=-20",
];

const seller: Seller = {
  id: "1",
  name: "Argan Essence",
  slug: "argan-essence",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  rating: 4.9,
  reviewCount: 2340,
  responseTime: "< 1 hour",
  responseRate: 98,
  joinedDate: "2019",
  isVerified: true,
  isTopSeller: true,
  totalSales: 15000,
  location: "Agadir",
};

const relatedProducts: Product[] = [
  {
    id: "r1",
    name: "Organic Rose Water - Damascus Rose",
    slug: "organic-rose-water",
    price: 89,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 2100,
    seller: { name: "Valley of Roses", isVerified: true },
    freeShipping: true,
  },
  {
    id: "r2",
    name: "Moroccan Black Soap - Eucalyptus",
    slug: "moroccan-black-soap",
    price: 65,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 890,
    seller: { name: "Hammam Traditions", isVerified: true },
    freeShipping: true,
  },
  {
    id: "r3",
    name: "Ghassoul Clay Mask - Pure Moroccan",
    slug: "ghassoul-clay-mask",
    price: 120,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 560,
    seller: { name: "Atlas Clay", isVerified: true },
    freeShipping: false,
  },
  {
    id: "r4",
    name: "Prickly Pear Seed Oil - 30ml",
    slug: "prickly-pear-seed-oil",
    price: 380,
    originalPrice: 450,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 1200,
    seller: { name: "Desert Gold", isVerified: true },
    badges: ["bestseller"],
    freeShipping: true,
  },
];

const reviews = [
  {
    id: "1",
    author: "Sarah M.",
    rating: 5,
    date: "2 weeks ago",
    content:
      "Absolutely amazing quality! The oil is pure and has helped my skin tremendously. Fast delivery too.",
    helpful: 24,
  },
  {
    id: "2",
    author: "Mohammed K.",
    rating: 5,
    date: "1 month ago",
    content:
      "Best argan oil I've ever purchased. You can tell it's authentic Moroccan product. Highly recommend!",
    helpful: 18,
  },
  {
    id: "3",
    author: "Emma L.",
    rating: 4,
    date: "1 month ago",
    content:
      "Great product, just wish the bottle was a bit bigger for the price. Otherwise perfect quality.",
    helpful: 12,
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: PageProps) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  const product = {
    name: "Pure Moroccan Argan Oil - Cold Pressed Organic",
    price: 249,
    originalPrice: 349,
    currency: "MAD",
    rating: 4.9,
    reviewCount: 2340,
    inStock: true,
    sku: "ARG-001-50ML",
    description: `Experience the liquid gold of Morocco with our premium cold-pressed Argan Oil. Sourced directly from the Argan forests of Souss-Massa, this 100% organic oil is produced using traditional methods passed down through generations.
    
Perfect for hair, skin, and nails, our Argan oil is rich in Vitamin E, essential fatty acids, and antioxidants. It absorbs quickly without leaving a greasy residue, making it ideal for daily use.

- 100% Pure & Organic
- Cold-pressed extraction
- No additives or preservatives  
- Certified organic
- 50ml bottle with dropper`,
    specifications: [
      { label: "Volume", value: "50ml" },
      { label: "Origin", value: "Agadir, Morocco" },
      { label: "Type", value: "Cold Pressed" },
      { label: "Certification", value: "USDA Organic, Ecocert" },
    ],
  };

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader cartItemCount={3} />

      <main className="pb-32 lg:pb-8">
        {/* Breadcrumb */}
        <div className="border-b border-border/50 px-4 py-3 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/category/beauty" className="hover:text-foreground">
                Beauty
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
          <div className="lg:flex lg:gap-10">
            {/* Left: Images */}
            <div className="lg:w-1/2">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary lg:rounded-3xl">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Discount Badge */}
                {discount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute left-4 top-4 text-sm"
                  >
                    -{discount}%
                  </Badge>
                )}

                {/* Actions */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full shadow-lg",
                      isWishlisted && "text-destructive"
                    )}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart
                      className={cn("h-5 w-5", isWishlisted && "fill-current")}
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all lg:h-20 lg:w-20",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div className="mt-6 lg:mt-0 lg:w-1/2">
              {/* Title & Rating */}
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground lg:text-3xl text-balance">
                  {product.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= Math.floor(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">
                      ({product.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold text-foreground lg:text-4xl">
                  {formatPrice(product.price, product.currency)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
                <Badge variant="success">Save {discount}%</Badge>
              </div>

              {/* Stock Status */}
              <div className="mt-4">
                {product.inStock ? (
                  <Badge variant="accent" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="secondary">Out of Stock</Badge>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-border/50 bg-secondary/30 p-4">
                <TrustBadge icon="truck" title="Free Shipping" variant="compact" />
                <TrustBadge icon="return" title="14-Day Returns" variant="compact" />
                <TrustBadge icon="shield" title="Verified Seller" variant="compact" />
              </div>

              {/* Quantity & Add to Cart */}
              <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                <div className="flex h-12 items-center rounded-xl border border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-l-xl rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-l-none rounded-r-xl"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button size="xl" className="flex-1">
                  Add to Cart - {formatPrice(product.price * quantity, product.currency)}
                </Button>
              </div>

              <Button variant="outline" size="lg" className="mt-3 w-full">
                Buy Now
              </Button>

              {/* Seller Panel */}
              <div className="mt-8">
                <SellerTrustPanel seller={seller} />
              </div>
            </div>
          </div>

          {/* Tabs: Description & Reviews */}
          <div className="mt-12">
            <div className="flex gap-6 border-b border-border/50">
              <button
                onClick={() => setActiveTab("description")}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors",
                  activeTab === "description"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors",
                  activeTab === "reviews"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Reviews ({product.reviewCount.toLocaleString()})
              </button>
            </div>

            <div className="py-6">
              {activeTab === "description" ? (
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{product.description}</p>

                  <h4 className="mt-6 font-medium text-foreground">
                    Specifications
                  </h4>
                  <div className="mt-3 space-y-2">
                    {product.specifications.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between border-b border-border/50 py-2 text-sm"
                      >
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border/50 pb-6 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-medium">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{review.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {review.content}
                      </p>
                      <button className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    Load More Reviews
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-12">
            <h2 className="mb-6 font-display text-xl font-semibold lg:text-2xl">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total Price</p>
              <p className="font-display text-xl font-semibold">
                {formatPrice(product.price * quantity, product.currency)}
              </p>
            </div>
            <Button size="lg" className="flex-1">
              Add to Cart
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
