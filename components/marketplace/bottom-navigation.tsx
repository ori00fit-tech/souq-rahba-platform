"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Grid3X3, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Grid3X3,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Account",
    href: "/account",
    icon: User,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 pb-safe backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-2xs font-medium transition-all",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
