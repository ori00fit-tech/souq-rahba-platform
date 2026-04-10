import ProductCard from "./ProductCard";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import SectionActionLink from "./SectionActionLink";
import { UI } from "./uiTokens";

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
    <SectionShell>
      <div style={s.headRow}>
        <SectionHead
          chip="FEATURED"
          title="منتجات مميزة"
          subtitle="اختيارات بارزة من باعة مختلفين داخل رحبة"
        />
        <SectionActionLink to="/products">عرض الكل ←</SectionActionLink>
      </div>

      <div style={s.grid}>
        {items.map((p) => (
          <ProductCard key={p.id || p.slug || p.title} product={p} />
        ))}
      </div>
    </SectionShell>
  );
}

const s = {
  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: UI.spacing.cardGap
  }
};
