import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b" };

const featuredProducts = [
  {
    title: "سماعات لاسلكية برو",
    seller: "متجر أطلس",
    price: 499,
    rating: "4.7",
    href: "/products",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "مصباح عصري لغرفة الجلوس",
    seller: "كازا ماركت",
    price: 349,
    rating: "4.5",
    href: "/products",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "حذاء رياضي مميز",
    seller: "موف سبورت",
    price: 799,
    rating: "4.8",
    href: "/products",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "مثقاب كهربائي لاسلكي",
    seller: "رحبة للأدوات",
    price: 649,
    rating: "4.6",
    href: "/products",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
  },
];

export default function FeaturedProductsSection() {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.headRow}>
        <SectionHead
          title="منتجات مميزة"
          sub="اختيارات شائعة من باعة مختلفين داخل السوق"
        />
        <Link to="/products" style={s.seeAll}>عرض الكل ←</Link>
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
  section: {
    display: "grid",
    gap: "18px",
  },

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
