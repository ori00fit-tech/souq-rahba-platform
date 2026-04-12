import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MessageCircle,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Seller {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  responseRate: number;
  joinedDate: string;
  isVerified: boolean;
  isTopSeller: boolean;
  totalSales: number;
  location: string;
}

interface SellerTrustPanelProps {
  seller: Seller;
  variant?: "default" | "compact" | "expanded";
  className?: string;
}

export function SellerTrustPanel({
  seller,
  variant = "default",
  className,
}: SellerTrustPanelProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/seller/${seller.slug}`}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-all hover:shadow-soft",
          className
        )}
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-secondary">
          {seller.avatar ? (
            <Image
              src={seller.avatar}
              alt={seller.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
              {seller.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{seller.name}</span>
            {seller.isVerified && (
              <ShieldCheck className="h-4 w-4 shrink-0 text-trust" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">
              {seller.rating} ({seller.reviewCount})
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    );
  }

  // Default & Expanded
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-4 lg:p-5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary lg:h-16 lg:w-16">
          {seller.avatar ? (
            <Image
              src={seller.avatar}
              alt={seller.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-primary-foreground">
              {seller.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{seller.name}</h3>
            {seller.isVerified && (
              <ShieldCheck className="h-5 w-5 shrink-0 text-trust" />
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {seller.isTopSeller && (
              <Badge variant="accent" className="text-2xs">
                Top Seller
              </Badge>
            )}
            <Badge variant="secondary" className="text-2xs">
              {seller.location}
            </Badge>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= Math.floor(seller.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{seller.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({seller.reviewCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px border-y border-border/50 bg-border/50">
        <div className="flex flex-col items-center gap-1 bg-card py-3">
          <div className="flex items-center gap-1 text-trust">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold">{seller.responseTime}</span>
          </div>
          <span className="text-2xs text-muted-foreground">Response Time</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-card py-3">
          <div className="flex items-center gap-1 text-trust">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold">{seller.responseRate}%</span>
          </div>
          <span className="text-2xs text-muted-foreground">Response Rate</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-card py-3">
          <div className="flex items-center gap-1 text-trust">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-sm font-semibold">
              {seller.totalSales.toLocaleString()}+
            </span>
          </div>
          <span className="text-2xs text-muted-foreground">Total Sales</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/seller/${seller.slug}`}>View Shop</Link>
        </Button>
        <Button variant="secondary" className="flex-1">
          <MessageCircle className="mr-1.5 h-4 w-4" />
          Contact
        </Button>
      </div>
    </div>
  );
}
