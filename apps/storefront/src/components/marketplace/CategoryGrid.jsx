import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import { UI } from "./uiTokens";
import { normalizeMarketplaceCategories } from "../../utils/marketplaceCategoryMapper";

export default function CategoryGrid({ categories = [] }) {
  const navigate = useNavigate();

  const items = useMemo(
    () => normalizeMarketplaceCategories(categories),
    [categories]
  );

  if (!items.length) return null;

  return (
    <SectionShell>
      <SectionHead
        chip="CATEGORIES"
        title="تصفح حسب الفئة"
        subtitle="اختار الفئة المناسبة وابدأ رحلة البحث بسرعة"
      />

      <div style={styles.grid}>
        {items.map((cat) => (
          <button
            key={cat.id || cat.slug || cat.name}
            onClick={() =>
              navigate(`/products?category=${encodeURIComponent(cat.slug)}`)
            }
            style={styles.card}
          >
            <div style={styles.iconWrap}>
              <span style={styles.icon}>{cat.icon}</span>
            </div>

            <div style={styles.body}>
              <div style={styles.name}>{cat.name}</div>
              <div style={styles.desc}>{cat.description}</div>
            </div>

            <div style={styles.arrow}>←</div>
          </button>
        ))}
      </div>
    </SectionShell>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: UI.spacing.cardGap
  },

  card: {
    display: "grid",
    gap: "10px",
    padding: UI.spacing.cardPadding,
    borderRadius: UI.radius.xl,
    border: `1px solid ${UI.colors.line}`,
    background: UI.colors.white,
    textAlign: "right",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative"
  },

  iconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.md,
    background: UI.colors.softBlue,
    display: "grid",
    placeItems: "center"
  },

  icon: {
    fontSize: "20px"
  },

  body: {
    display: "grid",
    gap: "4px"
  },

  name: {
    fontWeight: 900,
    color: UI.colors.ink,
    fontSize: "15px"
  },

  desc: {
    fontSize: UI.type.caption,
    color: UI.colors.muted,
    lineHeight: 1.6
  },

  arrow: {
    position: "absolute",
    left: "10px",
    bottom: "10px",
    fontSize: "14px",
    color: "#94a3b8"
  }
};
