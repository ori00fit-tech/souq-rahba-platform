"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  ChevronRight,
  Tag,
} from "lucide-react";
import { MobileHeader } from "@/components/marketplace/mobile-header";
import { BottomNavigation } from "@/components/marketplace/bottom-navigation";
import { TrustBadge } from "@/components/marketplace/trust-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  seller: {
    name: string;
    isVerified: boolean;
  };
  variant?: string;
  freeShipping?: boolean;
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Pure Moroccan Argan Oil - Cold Pressed Organic",
    slug: "pure-moroccan-argan-oil",
    price: 249,
    originalPrice: 349,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    seller: { name: "Argan Essence", isVerified: true },
    variant: "50ml",
    freeShipping: true,
  },
  {
    id: "2",
    name: "Handwoven Berber Wool Rug - Traditional Pattern",
    slug: "handwoven-berber-rug",
    price: 1890,
    originalPrice: 2490,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop",
    seller: { name: "Atlas Crafts", isVerified: true },
    variant: "Large (2m x 3m)",
    freeShipping: true,
  },
  {
    id: "3",
    name: "Premium Saffron Threads - Grade A",
    slug: "premium-saffron-threads",
    price: 189,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    seller: { name: "Taliouine Gold", isVerified: true },
    variant: "5g",
    freeShipping: false,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "rahba10") {
      setAppliedPromo("RAHBA10");
      setPromoCode("");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cartItems.some((item) => !item.freeShipping) ? 35 : 0;
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;
  const freeShippingThreshold = 500;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 pb-20 pt-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader cartItemCount={cartItems.length} />

      <main className="pb-40 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold lg:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              your cart
            </p>
          </div>

          {/* Free Shipping Progress */}
          {amountToFreeShipping > 0 && (
            <div className="mb-6 rounded-2xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Add {formatPrice(amountToFreeShipping)} more for free
                    shipping!
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{
                        width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="lg:flex lg:gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-soft"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary lg:h-32 lg:w-32"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="line-clamp-2 font-medium transition-colors hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.seller.name}
                          </span>
                          {item.seller.isVerified && (
                            <ShieldCheck className="h-3 w-3 text-trust" />
                          )}
                        </div>
                        {item.variant && (
                          <Badge variant="secondary" className="mt-1.5 text-2xs">
                            {item.variant}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3">
                      {/* Quantity */}
                      <div className="flex h-9 items-center rounded-lg border border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full w-9 rounded-l-lg rounded-r-none"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-9 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full w-9 rounded-l-none rounded-r-lg"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 lg:mt-0 lg:w-96">
              <div className="sticky top-20 rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                <h2 className="font-display text-lg font-semibold">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mt-5">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-xl bg-accent/10 p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">
                          {appliedPromo}
                        </span>
                      </div>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="secondary" onClick={applyPromo}>
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Try: RAHBA10 for 10% off
                  </p>
                </div>

                {/* Totals */}
                <div className="mt-5 space-y-3 border-t border-border/50 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-accent">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/50 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-xl font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button asChild size="xl" className="mt-5 w-full">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>

                {/* Trust */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-5">
                  <TrustBadge icon="secure" title="Secure Checkout" variant="inline" />
                  <TrustBadge icon="return" title="Easy Returns" variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Checkout */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display text-xl font-semibold">
                {formatPrice(total)}
              </p>
            </div>
            <Button asChild size="lg" className="flex-1">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
