import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PromoHero from "../components/marketplace/PromoHero";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import FeaturedProductsSection from "../components/marketplace/FeaturedProductsSection";
import SellerSpotlightSection from "../components/marketplace/SellerSpotlightSection";
import TrustSection from "../components/marketplace/TrustSection";
import SellCTA from "../components/marketplace/SellCTA";
import SectionShell from "../components/marketplace/SectionShell";
import { UI } from "../components/marketplace/uiTokens";
import { apiGet } from "../lib/api";
import HomeHero from "../components/marketplace/home/HomeHero";
import HomeSearchBand from "../components/marketplace/home/HomeSearchBand";
import HomePromoBanners from "../components/marketplace/home/HomePromoBanners";
import HomeTrustBar from "../components/marketplace/home/HomeTrustBar";
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
    <div style={s.stack}>
      <SectionShell>
        <div style={s.heroSkeletonInner}>
          <div style={{ ...s.skeletonLine, width: "120px", height: "14px" }} />
          <div style={{ ...s.skeletonLine, width: "260px", height: "32px" }} />
          <div style={{ ...s.skeletonLine, width: "78%", height: "14px" }} />
          <div style={s.heroSkeletonButtons}>
            <div style={{ ...s.skeletonLine, width: "140px", height: "42px", borderRadius: UI.radius.pill }} />
            <div style={{ ...s.skeletonLine, width: "140px", height: "42px", borderRadius: UI.radius.pill }} />
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function HomePageState({ title, text, tone = "neutral", actionLabel, actionHref, onAction }) {
  const toneStyle =
    tone === "error"
      ? s.errorCard
      : tone === "empty"
      ? s.emptyCard
      : s.statusCard;

  return (
    <SectionShell style={toneStyle}>
      <div style={s.stateIcon}>
        {tone === "error" ? "⚠️" : tone === "empty" ? "📭" : "ℹ️"}
      </div>

      <div style={s.sectionHeadingWrap}>
        <h2 style={s.stateTitle}>{title}</h2>
        <p style={s.stateText}>{text}</p>
      </div>

      {actionLabel ? (
        actionHref ? (
          <Link to={actionHref} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button type="button" className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null
      ) : null}
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
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "تعذر تحميل الصفحة الرئيسية"
        );
      }

      setHomeData(normalizeHomePayload(result.data));
    } catch (err) {
      if (err?.name === "AbortError") return;

      setHomeData({
        categories: [],
        featured_products: [],
        featured_sellers: []
      });

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
    <section className="container section-space" dir="rtl">
      <div style={s.stack}>
        <HomeHero />
        <HomeSearchBand />
        <HomeCommerceStrip />

        {loading ? (
          <HomePageSkeleton />
        ) : error ? (
          <HomePageState
            tone="error"
            title="تعذر تحميل الصفحة الرئيسية"
            text={error}
            actionLabel="إعادة المحاولة"
            onAction={() => loadHome()}
          />
        ) : !hasContent ? (
          <HomePageState
            tone="empty"
            title="لا توجد بيانات كافية للعرض حالياً"
            text="سنضيف الفئات والمنتجات والباعة المميزين هنا بمجرد توفرهم."
            actionLabel="تصفح المنتجات"
            actionHref="/products"
          />
        ) : (
          <>
            <CategoryGrid categories={homeData.categories} />
            <FeaturedProductsSection products={homeData.featured_products} />
            <HomePromoBanners />
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        <HomeTrustBar />
        <PromoHero />
        <TrustSection />
        <SellCTA />
      </div>
    </section>
  );
}

const s = {
  stack: {
    display: "grid",
    gap: UI.spacing.pageGap
  },

  heroSkeletonInner: {
    display: "grid",
    gap: "12px"
  },

  heroSkeletonButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  sectionHeadingWrap: {
    display: "grid",
    gap: "8px"
  },

  statusCard: {
    textAlign: "center"
  },

  errorCard: {
    textAlign: "center",
    border: `1.5px solid ${UI.colors.dangerBorder}`,
    background: "#fff7f7"
  },

  emptyCard: {
    textAlign: "center",
    border: "1.5px solid #e5dcc9",
    background: "#fffdfa"
  },

  stateIcon: {
    fontSize: "32px",
    lineHeight: 1
  },

  stateTitle: {
    margin: 0,
    fontSize: "26px",
    lineHeight: 1.3,
    fontWeight: 900,
    color: UI.colors.navy
  },

  stateText: {
    margin: 0,
    fontSize: UI.type.body,
    lineHeight: 1.9,
    color: UI.colors.muted
  },

  skeletonLine: {
    background: "linear-gradient(90deg, #f3efe6 0%, #ebe4d6 50%, #f3efe6 100%)",
    backgroundSize: "200% 100%",
    borderRadius: "12px",
    animation: "rahbaPulse 1.4s ease-in-out infinite"
  }
};
