import { MobileHeader } from "@/components/marketplace/mobile-header";
import { BottomNavigation } from "@/components/marketplace/bottom-navigation";
import { HeroSection } from "@/components/marketplace/hero-section";
import { FeaturedCategories } from "@/components/marketplace/featured-categories";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { TrustSection } from "@/components/marketplace/trust-badge";
import type { Product } from "@/components/marketplace/product-card";

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Pure Moroccan Argan Oil - Cold Pressed Organic",
    slug: "pure-moroccan-argan-oil",
    price: 249,
    originalPrice: 349,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 2340,
    seller: { name: "Argan Essence", isVerified: true },
    badges: ["bestseller"],
    freeShipping: true,
  },
  {
    id: "2",
    name: "Handwoven Berber Wool Rug - Traditional Pattern",
    slug: "handwoven-berber-rug",
    price: 1890,
    originalPrice: 2490,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 892,
    seller: { name: "Atlas Crafts", isVerified: true },
    badges: ["bestseller"],
    freeShipping: true,
  },
  {
    id: "3",
    name: "Moroccan Leather Pouf - Natural Tan",
    slug: "moroccan-leather-pouf",
    price: 650,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 456,
    seller: { name: "Fes Leather", isVerified: true },
    badges: ["new"],
    freeShipping: false,
  },
  {
    id: "4",
    name: "Premium Saffron Threads - Grade A",
    slug: "premium-saffron-threads",
    price: 189,
    originalPrice: 249,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 1205,
    seller: { name: "Taliouine Gold", isVerified: true },
    badges: ["sale"],
    freeShipping: true,
  },
  {
    id: "5",
    name: "Hand-painted Ceramic Tagine - Blue Fes",
    slug: "ceramic-tagine-blue",
    price: 420,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 328,
    seller: { name: "Fes Pottery", isVerified: true },
    freeShipping: false,
  },
  {
    id: "6",
    name: "Brass Moroccan Lantern - Large",
    slug: "brass-moroccan-lantern",
    price: 780,
    originalPrice: 950,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 567,
    seller: { name: "Marrakech Lights", isVerified: true },
    badges: ["sale"],
    freeShipping: true,
  },
  {
    id: "7",
    name: "Berber Silver Bracelet - Handcrafted",
    slug: "berber-silver-bracelet",
    price: 320,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 189,
    seller: { name: "Atlas Silver", isVerified: true },
    badges: ["new"],
    freeShipping: false,
  },
  {
    id: "8",
    name: "Organic Rose Water - Damascus Rose",
    slug: "organic-rose-water",
    price: 89,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 2100,
    seller: { name: "Valley of Roses", isVerified: true },
    badges: ["bestseller", "express"],
    freeShipping: true,
  },
];

const newArrivals: Product[] = [
  {
    id: "9",
    name: "Modern Moroccan Cushion Covers - Set of 4",
    slug: "moroccan-cushion-covers",
    price: 340,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 78,
    seller: { name: "Casa Home", isVerified: true },
    badges: ["new"],
    freeShipping: true,
  },
  {
    id: "10",
    name: "Leather Babouche Slippers - Men",
    slug: "leather-babouche-men",
    price: 220,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 234,
    seller: { name: "Marrakech Leather", isVerified: true },
    badges: ["new"],
    freeShipping: false,
  },
  {
    id: "11",
    name: "Thuya Wood Jewelry Box - Essaouira",
    slug: "thuya-wood-jewelry-box",
    price: 480,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 156,
    seller: { name: "Essaouira Woodcraft", isVerified: true },
    badges: ["new"],
    freeShipping: true,
  },
  {
    id: "12",
    name: "Ras El Hanout Spice Blend - Premium",
    slug: "ras-el-hanout-spice",
    price: 65,
    currency: "MAD",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 445,
    seller: { name: "Spice Souk", isVerified: true },
    badges: ["new", "express"],
    freeShipping: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader cartItemCount={3} />
      
      <main className="pb-20 lg:pb-0">
        <HeroSection />
        
        <FeaturedCategories />

        <ProductGrid
          title="Bestsellers"
          subtitle="Most loved by our customers"
          viewAllHref="/bestsellers"
          products={featuredProducts}
          variant="scroll"
        />

        <TrustSection />

        <ProductGrid
          title="New Arrivals"
          subtitle="Fresh finds just added"
          viewAllHref="/new"
          products={newArrivals}
          columns={4}
        />

        {/* Promo Banner */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-6 lg:p-12">
              <div className="relative z-10">
                <p className="text-sm font-medium text-primary-foreground/80">
                  Limited Time Offer
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-primary-foreground lg:text-4xl text-balance">
                  Free Shipping on Orders Over 500 MAD
                </h2>
                <p className="mt-2 max-w-md text-primary-foreground/80">
                  Shop now and get your authentic Moroccan products delivered free anywhere in Morocco.
                </p>
                <a
                  href="/deals"
                  className="mt-4 inline-flex items-center rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-background/90 lg:mt-6"
                >
                  Shop Deals
                </a>
              </div>
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary-foreground/10" />
              <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-foreground/5" />
            </div>
          </div>
        </section>

        <ProductGrid
          title="Trending Now"
          viewAllHref="/trending"
          products={featuredProducts.slice(0, 4)}
          columns={4}
        />

        {/* Footer */}
        <footer className="border-t border-border/50 bg-secondary/30 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="font-display text-lg font-bold text-primary-foreground">R</span>
                  </div>
                  <span className="font-display text-xl font-semibold">Rahba</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Morocco&apos;s premier marketplace for authentic products and trusted sellers.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-medium text-foreground">Shop</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a href="/categories" className="hover:text-foreground">All Categories</a></li>
                  <li><a href="/deals" className="hover:text-foreground">Deals</a></li>
                  <li><a href="/new" className="hover:text-foreground">New Arrivals</a></li>
                  <li><a href="/bestsellers" className="hover:text-foreground">Bestsellers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Support</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a href="/help" className="hover:text-foreground">Help Center</a></li>
                  <li><a href="/shipping" className="hover:text-foreground">Shipping Info</a></li>
                  <li><a href="/returns" className="hover:text-foreground">Returns</a></li>
                  <li><a href="/contact" className="hover:text-foreground">Contact Us</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Sell on Rahba</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a href="/sell" className="hover:text-foreground">Become a Seller</a></li>
                  <li><a href="/seller-center" className="hover:text-foreground">Seller Center</a></li>
                  <li><a href="/seller-guidelines" className="hover:text-foreground">Guidelines</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 lg:flex-row">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Rahba. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <a href="/privacy" className="hover:text-foreground">Privacy</a>
                <a href="/terms" className="hover:text-foreground">Terms</a>
                <button className="hover:text-foreground">FR | AR | EN</button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <BottomNavigation />
    </div>
  );
}
