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

function normalizeHomePayload(data) {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    featured_products: Array.isArray(data?.featured_products) ? data.featured_products : [],
    featured_sellers: Array.isArray(data?.featured_sellers) ? data.featured_sellers : []
  };
}

function SearchBand() {
  return (
    <section style={s.searchBand}>
      <div style={s.searchInner}>
        <div style={s.searchTitle}>
          ابحث عن <em style={s.searchEm}>أي شيء</em> تريده
        </div>

        <div style={s.searchBarShell}>
          <input
            style={s.searchInput}
            placeholder="ماذا تبحث عن؟ مثال: هاتف، أحذية، أدوات منزلية..."
          />
          <select style={s.searchSelect} defaultValue="">
            <option value="">كل الفئات</option>
            <option>إلكترونيات</option>
            <option>ملابس</option>
            <option>المنزل</option>
            <option>الرياضة</option>
          </select>
          <Link to="/products" style={s.searchBtn}>
            🔍 بحث
          </Link>
        </div>

        <div style={s.searchTags}>
          {["هاتف آيفون", "حذاء رياضي", "طاجين", "سماعات", "عطر", "حقيبة"].map((tag) => (
            <Link key={tag} to={`/products?q=${encodeURIComponent(tag)}`} style={s.searchTag}>
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommerceStrip() {
  const items = [
    "شحن مجاني للطلبات فوق 200 درهم",
    "الدفع عند الاستلام متوفر",
    "بائعون موثوقون من مختلف المدن",
    "متابعة الطلبات بسهولة"
  ];

  return (
    <section style={s.strip}>
      <div style={s.stripTrack}>
        {[...items, ...items].map((item, index) => (
          <div key={`${item}-${index}`} style={s.stripItem}>
            <span style={s.stripDot}>✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoBanners() {
  return (
    <section style={s.promoGrid}>
      <div style={{ ...s.promoCard, ...s.promoOne }}>
        <div style={s.promoEmoji}>🏷️</div>
        <div style={s.promoSub}>عروض حصرية</div>
        <div style={s.promoTitle}>خصومات قوية على المنتجات الأكثر طلبًا</div>
        <Link to="/products?sort=featured" style={s.promoBtn}>اكتشف الآن →</Link>
      </div>

      <div style={{ ...s.promoCard, ...s.promoTwo }}>
        <div style={s.promoEmoji}>🚀</div>
        <div style={s.promoSub}>للبائعين</div>
        <div style={s.promoTitle}>ابدأ البيع في رحبة اليوم</div>
        <Link to="/auth" style={s.promoBtn}>سجل الآن →</Link>
      </div>

      <div style={{ ...s.promoCard, ...s.promoThree }}>
        <div style={s.promoEmoji}>📦</div>
        <div style={s.promoSub}>توصيل</div>
        <div style={s.promoTitle}>تجربة شحن أوضح لمختلف المدن</div>
        <Link to="/help" style={s.promoBtn}>اعرف المزيد →</Link>
      </div>
    </section>
  );
}

function TrustBarV2() {
  const items = [
    { icon: "🚚", title: "شحن سريع", text: "توصيل لمدن متعددة داخل المغرب" },
    { icon: "🔒", title: "دفع آمن", text: "خيارات دفع أوضح للمستخدم" },
    { icon: "↩️", title: "متابعة الطلب", text: "تتبع وحالة الطلب بشكل أفضل" },
    { icon: "🤝", title: "باعة موثوقون", text: "صفحات متاجر تساعد على بناء الثقة" }
  ];

  return (
    <section style={s.trustBar}>
      {items.map((item) => (
        <div key={item.title} style={s.trustBarItem}>
          <span style={s.trustBarIcon}>{item.icon}</span>
          <div style={s.trustBarTitle}>{item.title}</div>
          <div style={s.trustBarDesc}>{item.text}</div>
        </div>
      ))}
    </section>
  );
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
        <SearchBand />
        <CommerceStrip />

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
            <PromoBanners />
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        <TrustBarV2 />
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

  searchBand: {
    background: UI.colors.ink,
    borderRadius: UI.radius.hero,
    padding: "24px 18px",
    overflow: "hidden"
  },

  searchInner: {
    display: "grid",
    gap: "14px"
  },

  searchTitle: {
    textAlign: "center",
    color: UI.colors.white,
    fontSize: UI.type.titleMd,
    fontWeight: 900
  },

  searchEm: {
    color: UI.colors.gold,
    fontStyle: "normal"
  },

  searchBarShell: {
    display: "grid",
    gap: "8px",
    background: UI.colors.white,
    borderRadius: UI.radius.xl,
    padding: "8px",
    boxShadow: "0 18px 42px rgba(0,0,0,.22)"
  },

  searchInput: {
    minHeight: "48px",
    border: "none",
    outline: "none",
    padding: "0 14px",
    fontFamily: "inherit",
    fontSize: "15px",
    direction: "rtl",
    color: UI.colors.ink,
    background: "transparent"
  },

  searchSelect: {
    minHeight: "44px",
    border: "1px solid #eee",
    borderRadius: UI.radius.md,
    padding: "0 12px",
    fontFamily: "inherit",
    color: "#555",
    background: "#F8F8F8"
  },

  searchBtn: {
    minHeight: "44px",
    borderRadius: UI.radius.md,
    background: UI.colors.coral,
    color: UI.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 800
  },

  searchTags: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap"
  },

  searchTag: {
    padding: "6px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.82)",
    border: "1px solid rgba(255,255,255,.14)",
    textDecoration: "none",
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  strip: {
    background: UI.colors.ink,
    borderRadius: UI.radius.xl,
    overflow: "hidden",
    padding: "12px 0"
  },

  stripTrack: {
    display: "flex",
    gap: "24px",
    overflowX: "auto",
    padding: "0 16px"
  },

  stripItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255,255,255,.84)",
    whiteSpace: "nowrap",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  stripDot: {
    color: UI.colors.gold,
    fontSize: UI.type.caption
  },

  promoGrid: {
    display: "grid",
    gap: "14px"
  },

  promoCard: {
    borderRadius: UI.radius.xxl,
    padding: "24px",
    minHeight: "220px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end"
  },

  promoOne: {
    background: "linear-gradient(135deg, #0D2C54, #0ABFB8)"
  },

  promoTwo: {
    background: "linear-gradient(135deg, #E8A020, #F05A28)"
  },

  promoThree: {
    background: "linear-gradient(135deg, #6C3FE8, #3BA5F5)"
  },

  promoEmoji: {
    position: "absolute",
    top: "16px",
    left: "16px",
    fontSize: "52px",
    opacity: 0.24
  },

  promoSub: {
    color: "rgba(255,255,255,.72)",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: "6px"
  },

  promoTitle: {
    color: UI.colors.white,
    fontSize: "24px",
    fontWeight: 900,
    lineHeight: 1.35,
    marginBottom: "12px"
  },

  promoBtn: {
    width: "fit-content",
    background: "rgba(255,255,255,.18)",
    border: "1.5px solid rgba(255,255,255,.30)",
    color: UI.colors.white,
    padding: "8px 14px",
    borderRadius: UI.radius.pill,
    textDecoration: "none",
    fontWeight: 800
  },

  trustBar: {
    background: UI.colors.ink,
    borderRadius: UI.radius.hero,
    padding: "26px 18px",
    display: "grid",
    gap: "18px"
  },

  trustBarItem: {
    textAlign: "center",
    display: "grid",
    gap: "6px"
  },

  trustBarIcon: {
    fontSize: "34px"
  },

  trustBarTitle: {
    color: UI.colors.white,
    fontSize: "16px",
    fontWeight: 900
  },

  trustBarDesc: {
    color: "rgba(255,255,255,.56)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.7
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
