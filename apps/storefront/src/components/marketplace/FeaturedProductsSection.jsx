import { useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
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
          subtitle="اختيارات بارزة من باعة موثوقين"
        />
        <Link to="/products" style={s.viewAll}>
          عرض الكل
          <ArrowIcon />
        </Link>
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

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 14px",
    background: UI.colors.bgElevated,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    color: UI.colors.textSecondary,
    fontSize: "13px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: UI.spacing.md
  }
};
