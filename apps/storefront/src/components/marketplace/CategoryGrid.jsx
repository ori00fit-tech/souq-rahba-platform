import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import { UI } from "./uiTokens";
import { normalizeMarketplaceCategories } from "../../utils/marketplaceCategoryMapper";

// Category icons mapping
const categoryIcons = {
  electronics: ElectronicsIcon,
  clothing: ClothingIcon,
  home: HomeIcon,
  sports: SportsIcon,
  beauty: BeautyIcon,
  automotive: CarIcon,
  default: GridIcon
};

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
        subtitle="اختر الفئة المناسبة وابدأ التسوق"
      />

      <div style={s.grid}>
        {items.map((cat) => {
          const IconComponent = categoryIcons[cat.slug] || categoryIcons.default;
          return (
            <button
              key={cat.id || cat.slug || cat.name}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
              style={s.card}
            >
              <div style={s.iconWrap}>
                <IconComponent />
              </div>
              <div style={s.cardContent}>
                <span style={s.name}>{cat.name}</span>
                {cat.count > 0 && (
                  <span style={s.count}>{cat.count} منتج</span>
                )}
              </div>
              <div style={s.arrow}>
                <ArrowIcon />
              </div>
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}

// Icons
function ElectronicsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 16h6M10 14v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClothingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 2L2 6v2l4-2v12h8V6l4 2V6l-4-4h-3l-1 2-1-2H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 8l7-5 7 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 18V12h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function SportsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BeautyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2v6M7 4l3 4 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="8" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10l2-4h10l2 4M3 10v4h14v-4M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6" cy="14" r="1.5" fill="currentColor" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: UI.spacing.md
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    background: UI.colors.bgElevated,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "right"
  },
  iconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: UI.radius.sm,
    background: UI.colors.accentMuted,
    color: UI.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0
  },
  name: {
    fontSize: "14px",
    fontWeight: 600,
    color: UI.colors.text
  },
  count: {
    fontSize: "12px",
    color: UI.colors.textMuted
  },
  arrow: {
    color: UI.colors.textMuted,
    flexShrink: 0
  }
};
