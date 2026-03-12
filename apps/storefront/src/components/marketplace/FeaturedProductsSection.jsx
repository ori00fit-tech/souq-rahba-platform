import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b" };

const featuredProducts = [
  {
    title: "Wireless Earbuds Pro",
    seller: "Atlas Store",
    price: 499,
    rating: "4.7",
    href: "/products",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Modern Living Room Lamp",
    seller: "Casa Market",
    price: 349,
    rating: "4.5",
    href: "/products",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Premium Running Shoes",
    seller: "Move Sports",
    price: 799,
    rating: "4.8",
    href: "/products",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Cordless Power Drill",
    seller: "Rahba Tools",
    price: 649,
    rating: "4.6",
    href: "/products",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
  },
];

export default function FeaturedProductsSection() {
  return (
    <section style={s.section}>
      <div style={s.headRow}>
        <SectionHead
          title="Featured Products"
          sub="Popular picks from sellers across the marketplace"
        />
        <Link to="/products" style={s.seeAll}>See all →</Link>
      </div>

      <div style={s.grid}>
        {featuredProducts.map((p) => (
          <ProductCard key={p.title} product={p} />
        ))}
      </div>
    </section>
  );
}

const s = {
  section: { display: "grid", gap: "18px" },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  seeAll: {
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
    color: T.navy,
    whiteSpace: "nowrap",
    alignSelf: "center",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "14px",
  },
};
