import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import SectionHead from "./SectionHead";

const T = {
  navy: "#16356b",
  border: "#ddd5c2",
  white: "#ffffff"
};

export default function FeaturedProductsSection({ products = [] }) {
  const items = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title_ar,
    name: p.title_ar,
    seller: p.seller_name || "RAHBA",
    seller_id: p.seller_id || null,
    price: Number(p.price_mad || 0),
    price_mad: Number(p.price_mad || 0),
    image: p.image_url || "",
    image_url: p.image_url || "",
    rating: Number(p.rating_avg || 0),
    reviews: Number(p.reviews_count || 0),
    stock: Number(p.stock || 0),
    description: p.description_ar || "",
    href: `/products/${p.slug}`
  }));

  if (!items.length) return null;

  return (
    <section style={s.section} dir="rtl">
      <div style={s.headRow}>
        <SectionHead
          chip="FEATURED"
          title="منتجات مميزة"
          subtitle="اختيارات بارزة من باعة مختلفين داخل رحبة"
        />
        <Link to="/products" style={s.seeAll}>عرض الكل ←</Link>
      </div>

      <div style={s.grid}>
        {items.map((p) => (
          <ProductCard key={p.id || p.slug || p.title} product={p} />
        ))}
      </div>
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gap: "18px"
  },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px"
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
    border: `1.5px solid ${T.border}`,
    background: T.white
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px"
  }
};
