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
    <SectionShell style={s.shell}>
      <div style={s.headRow}>
        <div style={s.headContent}>
          <SectionHead
            chip="FEATURED"
            title="منتجات مميزة"
            subtitle="اختيارات بارزة من باعة مختلفين داخل رحبة، مع عرض أوضح للمنتجات والأسعار والثقة."
          />

          <div style={s.metaRow}>
            <span style={s.metaChip}>منتجات مختارة</span>
            <span style={s.metaChip}>باعة متنوعون</span>
            <span style={s.metaChip}>تجربة أوضح</span>
          </div>
        </div>

        <div style={s.actionWrap}>
          <SectionActionLink to="/products">عرض الكل ←</SectionActionLink>
        </div>
      </div>

      <div style={s.grid}>
        {items.map((product) => (
          <div key={product.id || product.slug || product.name} style={s.cardWrap}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

const s = {
  shell: {
    display: "grid",
    gap: "18px",
    background: "linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%)",
    border: `1px solid ${UI.colors.border}`,
    boxShadow: "0 18px 42px rgba(11,15,26,0.05)",
  },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    flexWrap: "wrap",
  },

  headContent: {
    display: "grid",
    gap: "12px",
    minWidth: 0,
    flex: "1 1 520px",
  },

  actionWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: "fit-content",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  metaChip: {
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    background: "#ffffff",
    border: `1px solid ${UI.colors.border}`,
    color: UI.colors.navy,
    fontSize: UI.type.caption,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(11,15,26,0.04)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: UI.spacing.cardGap,
  },

  cardWrap: {
    display: "grid",
  },
};
