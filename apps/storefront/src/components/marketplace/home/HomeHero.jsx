import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { UI } from "../uiTokens";

export default function HomeHero() {
  const navigate = useNavigate();
  const { query, setQuery } = useApp();
  const [localQuery, setLocalQuery] = useState(query || "");

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setQuery(localQuery.trim());
      navigate(`/products?q=${encodeURIComponent(localQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section style={s.hero} dir="rtl">
      {/* Background elements */}
      <div style={s.gridOverlay} />
      <div style={s.glowAccent} />

      <div style={s.content}>
        {/* Badge */}
        <div style={s.badge}>
          <span style={s.badgeDot} />
          السوق المغربي الموثوق
        </div>

        {/* Title */}
        <h1 style={s.title}>
          اكتشف منتجات من
          <span style={s.titleAccent}> باعة موثوقين</span>
        </h1>

        {/* Subtitle */}
        <p style={s.subtitle}>
          تصفح آلاف المنتجات من متاجر مغربية موثوقة. شحن سريع، دفع آمن، وتجربة شراء واضحة.
        </p>

        {/* Search Box */}
        <form onSubmit={handleSearch} style={s.searchBox}>
          <div style={s.searchIcon}>
            <SearchIcon />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="ابحث عن منتج، فئة، أو بائع..."
            style={s.searchInput}
          />
          <button type="submit" style={s.searchBtn}>
            بحث
          </button>
        </form>

        {/* Quick Tags */}
        <div style={s.tagsRow}>
          <span style={s.tagsLabel}>الأكثر بحثاً:</span>
          {["هواتف", "ملابس", "إلكترونيات", "أحذية"].map((tag) => (
            <Link
              key={tag}
              to={`/products?q=${encodeURIComponent(tag)}`}
              style={s.tag}
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statValue}>+24K</span>
            <span style={s.statLabel}>منتج</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statValue}>+1.2K</span>
            <span style={s.statLabel}>بائع نشط</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statValue}>+15</span>
            <span style={s.statLabel}>مدينة</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={s.actions}>
          <Link to="/products" style={s.btnPrimary}>
            تصفح المنتجات
          </Link>
          <Link to="/sellers" style={s.btnSecondary}>
            اكتشف الباعة
          </Link>
        </div>
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 13L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const s = {
  hero: {
    position: "relative",
    overflow: "hidden",
    background: UI.colors.bgElevated,
    borderRadius: UI.radius.xl,
    padding: "32px 20px",
    border: `1px solid ${UI.colors.border}`
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    opacity: 0.03,
    backgroundImage: `
      linear-gradient(${UI.colors.text} 1px, transparent 1px),
      linear-gradient(90deg, ${UI.colors.text} 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px"
  },
  glowAccent: {
    position: "absolute",
    top: "-100px",
    right: "-100px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${UI.colors.accentMuted} 0%, transparent 70%)`,
    pointerEvents: "none"
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "640px"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    width: "fit-content",
    padding: "8px 14px",
    background: UI.colors.accentMuted,
    border: `1px solid ${UI.colors.borderAccent}`,
    borderRadius: UI.radius.pill,
    color: UI.colors.accent,
    fontSize: "12px",
    fontWeight: 600
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: UI.colors.accent
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    color: UI.colors.text,
    letterSpacing: "-0.02em"
  },
  titleAccent: {
    color: UI.colors.accent
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.7,
    color: UI.colors.textSecondary,
    maxWidth: "520px"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    padding: "6px 6px 6px 14px",
    maxWidth: "520px"
  },
  searchIcon: {
    color: UI.colors.textMuted,
    flexShrink: 0
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: UI.colors.text,
    fontSize: "14px",
    padding: "10px 0"
  },
  searchBtn: {
    height: "44px",
    padding: "0 20px",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    border: "none",
    borderRadius: UI.radius.sm,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease"
  },
  tagsRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  tagsLabel: {
    fontSize: "13px",
    color: UI.colors.textMuted
  },
  tag: {
    padding: "6px 12px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.pill,
    color: UI.colors.textSecondary,
    fontSize: "12px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: UI.colors.text
  },
  statLabel: {
    fontSize: "12px",
    color: UI.colors.textMuted
  },
  statDivider: {
    width: "1px",
    height: "32px",
    background: UI.colors.border
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  btnPrimary: {
    height: "48px",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    borderRadius: UI.radius.md,
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.2s ease"
  },
  btnSecondary: {
    height: "48px",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    color: UI.colors.text,
    borderRadius: UI.radius.md,
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease"
  }
};
