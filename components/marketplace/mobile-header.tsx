"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, Heart, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  cartItemCount?: number;
  notificationCount?: number;
}

export function MobileHeader({
  cartItemCount = 0,
  notificationCount = 0,
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-lg font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Rahba
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Categories
            </Link>
            <Link
              href="/deals"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Deals
            </Link>
            <Link
              href="/sellers"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Top Sellers
            </Link>
            <Link
              href="/sell"
              className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
            >
              Sell on Rahba
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Search - Desktop */}
            <Link href="/search" className="hidden lg:block">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden text-muted-foreground lg:flex"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-2xs font-medium text-destructive-foreground">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden lg:block">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-2xs font-medium text-primary-foreground">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            {/* User / Sign In - Desktop */}
            <Link href="/account" className="hidden lg:block">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="border-t border-border/40 px-4 py-2 lg:hidden">
          <Link href="/search" className="block">
            <div className="flex h-10 items-center gap-3 rounded-xl bg-secondary px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Search products, brands...
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[280px] bg-background shadow-premium transition-transform duration-300 lg:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-display text-lg font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col p-4">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="h-5 w-5" />
            Sign In / Register
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            <ShoppingBag className="h-5 w-5" />
            My Orders
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            <Heart className="h-5 w-5" />
            Wishlist
          </Link>

          <div className="my-3 border-t" />

          <Link
            href="/categories"
            className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            All Categories
          </Link>
          <Link
            href="/deals"
            className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            Today&apos;s Deals
          </Link>
          <Link
            href="/sellers"
            className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            onClick={() => setIsMenuOpen(false)}
          >
            Top Sellers
          </Link>

          <div className="my-3 border-t" />

          <Link
            href="/sell"
            className="rounded-lg bg-accent/10 px-3 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
            onClick={() => setIsMenuOpen(false)}
          >
            Sell on Rahba
          </Link>
          <Link
            href="/help"
            className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setIsMenuOpen(false)}
          >
            Help Center
          </Link>
        </nav>

        {/* Language Switcher */}
        <div className="absolute bottom-20 left-0 right-0 border-t px-4 py-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1">
              FR
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              AR
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              EN
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
