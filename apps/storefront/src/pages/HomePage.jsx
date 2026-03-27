import { useEffect, useMemo, useState } from "react";
import PromoHero from "../components/marketplace/PromoHero";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import FeaturedProductsSection from "../components/marketplace/FeaturedProductsSection";
import SellerSpotlightSection from "../components/marketplace/SellerSpotlightSection";
import TrustSection from "../components/marketplace/TrustSection";
import SellCTA from "../components/marketplace/SellCTA";
import { apiGet } from "../lib/api";

function normalizeHomePayload(data) {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    featured_products: Array.isArray(data?.featured_products) ? data.featured_products : [],
    featured_sellers: Array.isArray(data?.featured_sellers) ? data.featured_sellers : []
  };
}

function HomePageSkeleton() {
  return (
    <div style={styles.stack}>
      <div className="ui-card" style={styles.statusCard}>
        <div style={styles.skeletonHeader}>
          <div style={{ ...styles.skeletonLine, width: "120px", height: "14px" }} />
          <div style={{ ...styles.skeletonLine, width: "220px", height: "26px" }} />
          <div style={{ ...styles.skeletonLine, width: "70%", height: "14px" }} />
        </div>
      </div>

      <div style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="ui-card" style={styles.skeletonCard}>
            <div style={{ ...styles.skeletonLine, width: "46px", height: "46px", borderRadius: "14px" }} />
            <div style={{ ...styles.skeletonLine, width: "60%", height: "16px" }} />
            <div style={{ ...styles.skeletonLine, width: "80%", height: "12px" }} />
          </div>
        ))}
      </div>

      <div style={styles.skeletonGrid}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="ui-card" style={styles.skeletonProductCard}>
            <div style={{ ...styles.skeletonLine, width: "100%", height: "160px", borderRadius: "16px" }} />
            <div style={{ ...styles.skeletonLine, width: "45%", height: "12px" }} />
            <div style={{ ...styles.skeletonLine, width: "80%", height: "16px" }} />
            <div style={{ ...styles.skeletonLine, width: "35%", height: "18px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePageState({ title, text, tone = "neutral", actionLabel, onAction }) {
  const toneStyle =
    tone === "error"
      ? styles.errorCard
      : tone === "empty"
      ? styles.emptyCard
      : styles.statusCard;

  return (
    <div className="ui-card" style={toneStyle}>
      <div style={styles.stateIcon}>
        {tone === "error" ? "⚠️" : tone === "empty" ? "📭" : "ℹ️"}
      </div>
      <h2 style={styles.stateTitle}>{title}</h2>
      <p style={styles.stateText}>{text}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
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
      <div style={styles.stack}>
        <PromoHero />

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
            onAction={() => {
              window.location.href = "/products";
            }}
          />
        ) : (
          <>
            <CategoryGrid categories={homeData.categories} />
            <FeaturedProductsSection products={homeData.featured_products} />
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        <TrustSection />
        <SellCTA />
      </div>
    </section>
  );
}

const styles = {
  stack: {
    display: "grid",
    gap: "28px"
  },

  statusCard: {
    padding: "22px",
    display: "grid",
    gap: "14px",
    textAlign: "center"
  },

  errorCard: {
    padding: "22px",
    display: "grid",
    gap: "14px",
    textAlign: "center",
    border: "1.5px solid #fecaca",
    background: "#fff7f7"
  },

  emptyCard: {
    padding: "22px",
    display: "grid",
    gap: "14px",
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
    color: "#16356b"
  },

  stateText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.9,
    color: "#475569"
  },

  skeletonHeader: {
    display: "grid",
    gap: "12px",
    justifyItems: "center"
  },

  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px"
  },

  skeletonCard: {
    padding: "18px",
    display: "grid",
    gap: "12px"
  },

  skeletonProductCard: {
    padding: "14px",
    display: "grid",
    gap: "12px"
  },

  skeletonLine: {
    background: "linear-gradient(90deg, #f3efe6 0%, #ebe4d6 50%, #f3efe6 100%)",
    backgroundSize: "200% 100%",
    borderRadius: "12px",
    animation: "rahbaPulse 1.4s ease-in-out infinite"
  }
};
