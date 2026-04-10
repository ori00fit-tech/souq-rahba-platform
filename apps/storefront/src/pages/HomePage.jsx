import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function TrustStrip() {
  const items = [
    { icon: "💵", title: "الدفع عند الاستلام", text: "اطلب بثقة وخلّص عند الاستلام" },
    { icon: "🚚", title: "توصيل لجميع المدن", text: "الباعة يرسلون الطلبات حسب المدينة" },
    { icon: "🔒", title: "شراء آمن", text: "تتبع الطلبات وإدارة أفضل داخل رحبة" },
    { icon: "📞", title: "تواصل مباشر", text: "سهولة التواصل مع البائع عند الحاجة" }
  ];

  return (
    <section className="ui-card" style={styles.trustStripShell}>
      <div style={styles.sectionHeadingWrap}>
        <div className="ui-chip">RAHBA TRUST</div>
        <h2 style={styles.sectionHeading}>تجربة شراء مغربية واضحة وموثوقة</h2>
        <p style={styles.sectionSubheading}>
          بنينا رحبة لتكون بسيطة، سريعة، وقريبة من طريقة الشراء الحقيقية في السوق المغربي.
        </p>
      </div>

      <div style={styles.trustGrid}>
        {items.map((item) => (
          <div key={item.title} className="ui-card-soft" style={styles.trustMiniCard}>
            <div style={styles.trustMiniIcon}>{item.icon}</div>
            <div style={styles.trustMiniBody}>
              <div style={styles.trustMiniTitle}>{item.title}</div>
              <div style={styles.trustMiniText}>{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePageSkeleton() {
  return (
    <div style={styles.stack}>
      <div className="ui-card" style={styles.heroSkeletonCard}>
        <div style={styles.heroSkeletonInner}>
          <div style={{ ...styles.skeletonLine, width: "110px", height: "14px" }} />
          <div style={{ ...styles.skeletonLine, width: "260px", height: "28px" }} />
          <div style={{ ...styles.skeletonLine, width: "80%", height: "14px" }} />
          <div style={styles.heroSkeletonButtons}>
            <div style={{ ...styles.skeletonLine, width: "140px", height: "42px", borderRadius: "999px" }} />
            <div style={{ ...styles.skeletonLine, width: "140px", height: "42px", borderRadius: "999px" }} />
          </div>
        </div>
      </div>

      <div style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="ui-card-soft" style={styles.skeletonCard}>
            <div style={{ ...styles.skeletonLine, width: "46px", height: "46px", borderRadius: "14px" }} />
            <div style={{ ...styles.skeletonLine, width: "60%", height: "16px" }} />
            <div style={{ ...styles.skeletonLine, width: "82%", height: "12px" }} />
          </div>
        ))}
      </div>

      <div style={styles.skeletonGrid}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="ui-card" style={styles.skeletonProductCard}>
            <div style={{ ...styles.skeletonLine, width: "100%", height: "170px", borderRadius: "18px" }} />
            <div style={{ ...styles.skeletonLine, width: "40%", height: "12px" }} />
            <div style={{ ...styles.skeletonLine, width: "78%", height: "16px" }} />
            <div style={{ ...styles.skeletonLine, width: "34%", height: "18px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePageState({ title, text, tone = "neutral", actionLabel, actionHref, onAction }) {
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

      <div style={styles.sectionHeadingWrap}>
        <h2 style={styles.stateTitle}>{title}</h2>
        <p style={styles.stateText}>{text}</p>
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
    </div>
  );
}

function HomeHeroShell() {
  return (
    <section className="ui-card" style={styles.heroShell}>
      <div style={styles.heroBadgeRow}>
        <span className="ui-chip">RAHBA MARKETPLACE</span>
        <span style={styles.heroCityPill}>🇲🇦 السوق المغربي أولاً</span>
      </div>

      <div style={styles.heroContent}>
        <div style={styles.heroTextCol}>
          <h1 style={styles.heroTitle}>
            سوق مغربي موثوق
            <br />
            للشراء من بائعين حقيقيين
          </h1>

          <p style={styles.heroText}>
            رحبة تجمع بين بساطة الشراء، وضوح الأسعار، وسهولة التواصل، مع تجربة أنظف وأسرع
            للمستخدم المغربي.
          </p>

          <div style={styles.heroActionRow}>
            <Link to="/products" className="btn btn-primary">
              ابدأ التسوق
            </Link>
            <Link to="/sell" className="btn btn-secondary">
              ابدأ البيع
            </Link>
          </div>
        </div>

        <div style={styles.heroStatsCol}>
          <div className="ui-card-soft" style={styles.heroStatCard}>
            <strong style={styles.heroStatValue}>COD</strong>
            <span style={styles.heroStatLabel}>الدفع عند الاستلام</span>
          </div>

          <div className="ui-card-soft" style={styles.heroStatCard}>
            <strong style={styles.heroStatValue}>Sellers</strong>
            <span style={styles.heroStatLabel}>بائعون ومتاجر داخل رحبة</span>
          </div>

          <div className="ui-card-soft" style={styles.heroStatCard}>
            <strong style={styles.heroStatValue}>Tracking</strong>
            <span style={styles.heroStatLabel}>متابعة الطلبات بسهولة</span>
          </div>
        </div>
      </div>
    </section>
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
        <HomeHeroShell />
        <TrustStrip />

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
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        <PromoHero />
        <TrustSection />
        <SellCTA />
      </div>
    </section>
  );
}

const styles = {
  stack: {
    display: "grid",
    gap: "26px"
  },

  heroShell: {
    padding: "18px",
    display: "grid",
    gap: "16px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.08) 0%, rgba(20,184,166,0.08) 100%)",
    border: "1px solid #dfe7f3"
  },

  heroBadgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  heroCityPill: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#fff",
    border: "1px solid #dbe4ee",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800
  },

  heroContent: {
    display: "grid",
    gap: "14px"
  },

  heroTextCol: {
    display: "grid",
    gap: "12px"
  },

  heroTitle: {
    margin: 0,
    color: "#16356b",
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 900
  },

  heroText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.9,
    fontSize: "15px"
  },

  heroActionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  heroStatsCol: {
    display: "grid",
    gap: "10px"
  },

  heroStatCard: {
    padding: "14px",
    display: "grid",
    gap: "4px"
  },

  heroStatValue: {
    color: "#173b74",
    fontSize: "18px",
    fontWeight: 900
  },

  heroStatLabel: {
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "13px",
    fontWeight: 700
  },

  trustStripShell: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },

  sectionHeadingWrap: {
    display: "grid",
    gap: "8px"
  },

  sectionHeading: {
    margin: 0,
    color: "#16356b",
    fontSize: "24px",
    lineHeight: 1.3,
    fontWeight: 900
  },

  sectionSubheading: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.9,
    fontSize: "14px"
  },

  trustGrid: {
    display: "grid",
    gap: "10px"
  },

  trustMiniCard: {
    padding: "14px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start"
  },

  trustMiniIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    display: "grid",
    placeItems: "center",
    fontSize: "16px",
    flexShrink: 0
  },

  trustMiniBody: {
    display: "grid",
    gap: "4px"
  },

  trustMiniTitle: {
    color: "#16356b",
    fontWeight: 900
  },

  trustMiniText: {
    color: "#64748b",
    lineHeight: 1.8,
    fontSize: "13px"
  },

  heroSkeletonCard: {
    padding: "20px",
    display: "grid",
    gap: "14px"
  },

  heroSkeletonInner: {
    display: "grid",
    gap: "12px"
  },

  heroSkeletonButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "4px"
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
