import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import FeaturedProductsSection from "../components/marketplace/FeaturedProductsSection";
import SellerSpotlightSection from "../components/marketplace/SellerSpotlightSection";
import TrustSection from "../components/marketplace/TrustSection";
import SellCTA from "../components/marketplace/SellCTA";
import SectionShell from "../components/marketplace/SectionShell";
import { UI } from "../components/marketplace/uiTokens";
import { apiGet } from "../lib/api";
import HomeHero from "../components/marketplace/home/HomeHero";
import HomeCommerceStrip from "../components/marketplace/home/HomeCommerceStrip";

function normalizeHomePayload(data) {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    featured_products: Array.isArray(data?.featured_products) ? data.featured_products : [],
    featured_sellers: Array.isArray(data?.featured_sellers) ? data.featured_sellers : []
  };
}

function HomePageSkeleton() {
  return (
    <div style={s.skeletonWrap}>
      <div style={s.skeletonCard}>
        <div style={{ ...s.skeletonLine, width: "120px", height: "20px" }} />
        <div style={{ ...s.skeletonLine, width: "200px", height: "28px" }} />
        <div style={{ ...s.skeletonLine, width: "100%", height: "14px" }} />
        <div style={s.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={s.skeletonItem} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePageState({ title, text, tone = "neutral", actionLabel, actionHref, onAction }) {
  const toneStyles = {
    error: { background: UI.colors.errorBg, borderColor: UI.colors.errorBorder },
    empty: { background: UI.colors.surface, borderColor: UI.colors.border },
    neutral: { background: UI.colors.surface, borderColor: UI.colors.border }
  };

  return (
    <SectionShell style={{ ...toneStyles[tone], textAlign: "center", alignItems: "center" }}>
      <div style={s.stateIcon}>
        {tone === "error" ? <ErrorIcon /> : <EmptyIcon />}
      </div>
      <h2 style={s.stateTitle}>{title}</h2>
      <p style={s.stateText}>{text}</p>
      {actionLabel && (
        actionHref ? (
          <Link to={actionHref} style={s.stateBtn}>{actionLabel}</Link>
        ) : onAction ? (
          <button type="button" style={s.stateBtn} onClick={onAction}>{actionLabel}</button>
        ) : null
      )}
    </SectionShell>
  );
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [homeData, setHomeData] = useState({
    categories: [],
    featured_products: [],
    featured_sellers: []
  });

  async function loadHome(signal) {
    try {
      setLoading(true);
      setError("");
      const result = await apiGet("/catalog/home", signal ? { signal } : {});
      if (!result?.ok) {
        throw new Error(result?.error?.message || result?.message || "تعذر تحميل الصفحة الرئيسية");
      }
      setHomeData(normalizeHomePayload(result.data));
    } catch (err) {
      if (err?.name === "AbortError") return;
      setHomeData({ categories: [], featured_products: [], featured_sellers: [] });
      setError(err?.message || "حدث خطأ أثناء تحميل الصفحة الرئيسية");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadHome(controller.signal);
    return () => controller.abort();
  }, []);

  const hasContent = useMemo(() => {
    return (
      homeData.categories.length > 0 ||
      homeData.featured_products.length > 0 ||
      homeData.featured_sellers.length > 0
    );
  }, [homeData]);

  return (
    <main className="container section-space" dir="rtl">
      <div style={s.stack}>
        {/* Hero Section with Search */}
        <HomeHero />

        {/* Trust/Commerce Strip */}
        <HomeCommerceStrip />

        {/* Main Content */}
        {loading ? (
          <HomePageSkeleton />
        ) : error ? (
          <HomePageState
            tone="error"
            title="تعذر تحميل المحتوى"
            text={error}
            actionLabel="إعادة المحاولة"
            onAction={() => loadHome()}
          />
        ) : !hasContent ? (
          <HomePageState
            tone="empty"
            title="لا توجد بيانات للعرض حالياً"
            text="سيتم إضافة الفئات والمنتجات والباعة المميزين قريباً."
            actionLabel="تصفح المنتجات"
            actionHref="/products"
          />
        ) : (
          <>
            {/* Categories */}
            <CategoryGrid categories={homeData.categories} />

            {/* Featured Products */}
            <FeaturedProductsSection products={homeData.featured_products} />

            {/* Featured Sellers */}
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        {/* Trust Section */}
        <TrustSection />

        {/* Sell CTA */}
        <SellCTA />
      </div>
    </main>
  );
}

// Icons
function ErrorIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" stroke={UI.colors.error} strokeWidth="2" />
      <path d="M20 12v10M20 26v2" stroke={UI.colors.error} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="6" width="24" height="28" rx="3" stroke={UI.colors.textMuted} strokeWidth="2" />
      <path d="M14 14h12M14 20h8M14 26h10" stroke={UI.colors.textMuted} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const s = {
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: UI.spacing.xl
  },
  skeletonWrap: {
    display: "flex",
    flexDirection: "column",
    gap: UI.spacing.lg
  },
  skeletonCard: {
    display: "flex",
    flexDirection: "column",
    gap: UI.spacing.md,
    padding: UI.spacing.lg,
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.lg
  },
  skeletonLine: {
    background: `linear-gradient(90deg, ${UI.colors.bgElevated} 0%, ${UI.colors.surface} 50%, ${UI.colors.bgElevated} 100%)`,
    backgroundSize: "200% 100%",
    borderRadius: UI.radius.sm,
    animation: "shimmer 1.5s ease-in-out infinite"
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: UI.spacing.md
  },
  skeletonItem: {
    height: "120px",
    background: `linear-gradient(90deg, ${UI.colors.bgElevated} 0%, ${UI.colors.surface} 50%, ${UI.colors.bgElevated} 100%)`,
    backgroundSize: "200% 100%",
    borderRadius: UI.radius.md,
    animation: "shimmer 1.5s ease-in-out infinite"
  },
  stateIcon: {
    marginBottom: "8px"
  },
  stateTitle: {
    margin: 0,
    fontSize: UI.type.titleMd,
    fontWeight: 600,
    color: UI.colors.text
  },
  stateText: {
    margin: 0,
    fontSize: UI.type.body,
    color: UI.colors.textMuted,
    maxWidth: "400px"
  },
  stateBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    padding: "0 20px",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    borderRadius: UI.radius.md,
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    border: "none",
    cursor: "pointer"
  }
};
