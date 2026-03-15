import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b" };

export default function FeaturedProductsSection({ products = [] }) {
  const items = products.map((p) => ({
    title: p.title_ar,
    seller: p.seller_name || "متجر رحبة",
    price: p.price_mad,
    rating: "4.8",
    href: `/products/${p.slug}`,
    image: p.image_url,
  }));

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
        {items.map((p) => (
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
