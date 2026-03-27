import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b" };

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
    badge: p.featured ? "مميز" : "",
    href: `/products/${p.slug}`
  }));

  return (
    <section style={s.section} dir="rtl">
      <div style={s.headWrap}>
        <div style={s.headRow}>
          <SectionHead
            title="منتجات مميزة"
            sub="اختيارات شائعة من باعة مختلفين داخل السوق مع عرض أسرع للمعلومات الأساسية"
          />
          <Link to="/products" style={s.seeAll}>عرض الكل ←</Link>
        </div>

        <div style={s.infoStrip}>
          <span style={s.infoChip}>اختيارات بارزة</span>
          <span style={s.infoChip}>عرض سريع</span>
          <span style={s.infoChip}>جاهزة للشراء</span>
        </div>
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

  headWrap: {
    display: "grid",
    gap: "10px"
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
    borderRadius: "12px",
    border: "1.5px solid #ddd5c2",
    background: "#fff"
  },

  infoStrip: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  infoChip: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#475569",
    background: "#fff",
    border: "1px solid #e5dcc9",
    padding: "7px 11px",
    borderRadius: "999px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "14px"
  }
};
