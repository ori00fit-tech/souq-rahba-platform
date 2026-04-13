import { useMemo } from "react";
import ProductCard from "./ProductCard";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import SectionActionLink from "./SectionActionLink";
import { UI } from "./uiTokens";
import { normalizeMarketplaceProducts } from "../../utils/marketplaceProductMapper";

export default function FeaturedProductsSection({ products = [] }) {
  const items = useMemo(
    () => normalizeMarketplaceProducts(products),
    [products]
  );

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
        {items.map((product) => (
          <ProductCard
            key={product.id || product.slug || product.name}
            product={product}
          />
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
    gap: "12px",
    flexWrap: "wrap"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: UI.spacing.cardGap
  }
};
