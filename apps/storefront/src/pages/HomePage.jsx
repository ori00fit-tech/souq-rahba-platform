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

function normalizeHomePayload(data) {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    featured_products: Array.isArray(data?.featured_products) ? data.featured_products : [],
    featured_sellers: Array.isArray(data?.featured_sellers) ? data.featured_sellers : []
  };
}

function HeroV3() {
  return (
    <section style={s.heroWrap} dir="rtl">
      <div style={s.heroBlobOne} />
      <div style={s.heroBlobTwo} />

      <div style={s.heroGrid}>
        <div style={s.heroTextCol}>
          <div style={s.heroBadge}>سوق مغربي رقمي متكامل</div>

          <h1 style={s.heroTitle}>
            اشتري وبع
            <br />
            <span style={s.heroUnderline}>بكل سهولة</span>
            <br />
            في <span style={s.heroAccent}>رحبة</span>
          </h1>

          <p style={s.heroSub}>
            منصة مغربية حديثة تجمع البائعين والمشترين في تجربة أوضح، أسرع، وأجمل —
            مع متاجر موثوقة ومنتجات متنوعة من مدن المغرب.
          </p>

          <div style={s.heroActions}>
            <Link to="/products" className="btn btn-primary">
              تسوق الآن
            </Link>
            <Link to="/sellers" className="btn btn-secondary">
              اكتشف البائعين
            </Link>
          </div>

          <div style={s.heroStats}>
            <div style={s.heroStat}>
              <strong style={s.heroStatValue}>+24k</strong>
              <span style={s.heroStatLabel}>منتج متوفر</span>
            </div>
            <div style={s.heroStat}>
              <strong style={s.heroStatValue}>+1.2k</strong>
              <span style={s.heroStatLabel}>بائع نشط</span>
            </div>
            <div style={s.heroStat}>
              <strong style={s.heroStatValue}>+15</strong>
              <span style={s.heroStatLabel}>مدينة مغربية</span>
            </div>
          </div>
        </div>

        <div style={s.heroVisualCol}>
          <div style={s.floatCardTop}>
            <span style={s.floatEmoji}>🎉</span>
            <div style={s.floatTextWrap}>
              <strong style={s.floatStrong}>طلب جديد!</strong>
              <span style={s.floatSmall}>قبل دقيقتين</span>
            </div>
          </div>

          <div style={s.mainProductCard}>
            <div style={s.mainProductMedia}>🛍️</div>
            <div style={s.mainProductBody}>
              <div style={s.mainProductTag}>رحبة ✦</div>
              <div style={s.mainProductName}>منتجات مختارة من باعة موثوقين</div>
              <div style={s.mainProductRow}>
                <div style={s.mainProductPrice}>Marketplace</div>
                <div style={s.plusBtn}>+</div>
              </div>
            </div>
          </div>

          <div style={s.floatCardBottom}>
            <div style={s.stars}>★★★★★</div>
            <div style={s.floatSmall}>تجربة شراء أوضح وأسهل</div>
          </div>
        </div>
      </div>
    </section>
  );
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
        <HeroV3 />
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

  heroWrap: {
    position: "relative",
    overflow: "hidden",
    background: UI.colors.cream,
    borderRadius: UI.radius.hero,
    minHeight: "620px",
    display: "grid",
    alignItems: "center",
    padding: "28px 22px",
    boxShadow: UI.shadow.soft
  },

  heroBlobOne: {
    position: "absolute",
    top: "-100px",
    left: "-140px",
    width: "420px",
    height: "420px",
    borderRadius: "58% 42% 70% 30% / 40% 60% 30% 70%",
    background: "conic-gradient(from 180deg, #0ABFB8, #3BA5F5, #6C3FE8, #0ABFB8)",
    opacity: 0.08
  },

  heroBlobTwo: {
    position: "absolute",
    bottom: "-100px",
    right: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "40% 60% 30% 70% / 60% 40% 70% 30%",
    background: "radial-gradient(circle, #E8A020, #F05A28)",
    opacity: 0.08
  },

  heroGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "26px"
  },

  heroTextCol: {
    display: "grid",
    gap: "16px"
  },

  heroBadge: {
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: UI.radius.pill,
    background: UI.colors.softMint,
    color: UI.colors.tealDark,
    border: "1.5px solid rgba(10,191,184,.24)",
    fontSize: UI.type.bodySm,
    fontWeight: 800
  },

  heroTitle: {
    margin: 0,
    fontSize: UI.type.hero,
    lineHeight: 1.12,
    letterSpacing: "-0.03em",
    color: UI.colors.ink,
    fontWeight: 900
  },

  heroUnderline: {
    position: "relative",
    display: "inline-block",
    boxShadow: "inset 0 -10px 0 rgba(232,160,32,.34)"
  },

  heroAccent: {
    color: UI.colors.teal
  },

  heroSub: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.9,
    color: "#555",
    maxWidth: "580px"
  },

  heroActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  heroStats: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap"
  },

  heroStat: {
    display: "grid",
    gap: "4px",
    minWidth: "88px"
  },

  heroStatValue: {
    color: UI.colors.ink,
    fontSize: "24px",
    fontWeight: 900
  },

  heroStatLabel: {
    color: "#7a7a7a",
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  heroVisualCol: {
    position: "relative",
    minHeight: "360px",
    display: "grid",
    placeItems: "center"
  },

  floatCardTop: {
    position: "absolute",
    top: "10px",
    right: "0",
    background: UI.colors.white,
    borderRadius: UI.radius.lg,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: UI.shadow.medium
  },

  floatCardBottom: {
    position: "absolute",
    bottom: "8px",
    left: "0",
    background: UI.colors.white,
    borderRadius: UI.radius.lg,
    padding: "12px 14px",
    display: "grid",
    gap: "4px",
    boxShadow: UI.shadow.medium
  },

  floatEmoji: {
    fontSize: "24px"
  },

  floatTextWrap: {
    display: "grid",
    gap: "2px"
  },

  floatStrong: {
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    color: UI.colors.ink
  },

  floatSmall: {
    fontSize: UI.type.caption,
    color: "#888"
  },

  stars: {
    color: UI.colors.gold,
    letterSpacing: "2px",
    fontSize: UI.type.bodySm
  },

  mainProductCard: {
    width: "320px",
    background: UI.colors.white,
    borderRadius: UI.radius.xxl,
    overflow: "hidden",
    boxShadow: UI.shadow.hero
  },

  mainProductMedia: {
    width: "100%",
    height: "220px",
    background: "linear-gradient(135deg, #FDE3D4, #EDE8FF)",
    display: "grid",
    placeItems: "center",
    fontSize: "72px"
  },

  mainProductBody: {
    padding: "18px",
    display: "grid",
    gap: "8px"
  },

  mainProductTag: {
    width: "fit-content",
    padding: "4px 10px",
    borderRadius: "8px",
    background: UI.colors.softMint,
    color: UI.colors.tealDark,
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  mainProductName: {
    color: UI.colors.ink,
    fontWeight: 800,
    fontSize: "16px",
    lineHeight: 1.5
  },

  mainProductRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },

  mainProductPrice: {
    color: UI.colors.coral,
    fontWeight: 900,
    fontSize: "18px"
  },

  plusBtn: {
    width: "38px",
    height: "38px",
    borderRadius: UI.radius.md,
    background: UI.colors.ink,
    color: UI.colors.white,
    display: "grid",
    placeItems: "center",
    fontSize: "22px",
    fontWeight: 900
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
