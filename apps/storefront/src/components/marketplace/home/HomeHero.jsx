import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomeHero() {
  return (
    <section style={s.heroWrap} dir="rtl">
      <div style={s.bgGlowOne} />
      <div style={s.bgGlowTwo} />
      <div style={s.gridOverlay} />

      <div style={s.heroGrid}>
        <div style={s.heroTextCol}>
          <div style={s.heroBadge}>RAHBA MARKETPLACE</div>

          <h1 style={s.heroTitle}>
            تسوق من باعة موثوقين
            <br />
            <span style={s.heroAccent}>في تجربة أوضح وأجمل</span>
          </h1>

          <p style={s.heroSub}>
            رحبة منصة مغربية حديثة للتجارة الرقمية، تجمع بين الباعة والمشترين
            داخل تجربة أكثر ثقة، أسرع في التصفح، وأسهل في الوصول إلى المنتج المناسب.
          </p>

          <div style={s.heroActions}>
            <Link to="/products" className="btn btn-primary">
              ابدأ التسوق
            </Link>
            <Link to="/sellers" className="btn btn-secondary">
              تصفح البائعين
            </Link>
          </div>

          <div style={s.heroStats}>
            <div style={s.statCard}>
              <strong style={s.statValue}>+24k</strong>
              <span style={s.statLabel}>منتج متوفر</span>
            </div>
            <div style={s.statCard}>
              <strong style={s.statValue}>+1.2k</strong>
              <span style={s.statLabel}>بائع نشط</span>
            </div>
            <div style={s.statCard}>
              <strong style={s.statValue}>+15</strong>
              <span style={s.statLabel}>مدينة مغربية</span>
            </div>
          </div>
        </div>

        <div style={s.heroVisualCol}>
          <div style={s.floatingTopCard}>
            <div style={s.miniIcon}>⚡</div>
            <div style={s.miniTextWrap}>
              <strong style={s.miniStrong}>بحث أسرع</strong>
              <span style={s.miniSmall}>نتائج أوضح وتجربة أفضل</span>
            </div>
          </div>

          <div style={s.mainCard}>
            <div style={s.mainCardHeader}>
              <div style={s.mainCardPill}>رحبة ✦ مختارات</div>
              <div style={s.mainCardStatus}>موثوق</div>
            </div>

            <div style={s.mainCardBody}>
              <div style={s.productMediaBox}>
                <div style={s.productMediaInner}>🛍️</div>
              </div>

              <div style={s.productInfo}>
                <h3 style={s.productTitle}>منتجات مختارة من متاجر موثوقة</h3>
                <p style={s.productText}>
                  اكتشف منتجات متنوعة من باعة نشطين داخل المغرب، مع واجهة أبسط
                  وتجربة شراء أوضح.
                </p>

                <div style={s.productMetaRow}>
                  <span style={s.metaChip}>شحن أسرع</span>
                  <span style={s.metaChip}>دفع آمن</span>
                  <span style={s.metaChip}>متابعة الطلب</span>
                </div>
              </div>
            </div>

            <div style={s.mainCardFooter}>
              <div style={s.footerPriceWrap}>
                <span style={s.footerPriceLabel}>Marketplace</span>
                <strong style={s.footerPrice}>رحبة</strong>
              </div>
              <div style={s.footerAction}>+</div>
            </div>
          </div>

          <div style={s.floatingBottomCard}>
            <div style={s.stars}>★★★★★</div>
            <div style={s.miniSmall}>تجربة شراء أوضح وأسهل للمستخدم</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  heroWrap: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f8fbff 0%, #f4f7fc 45%, #fffaf5 100%)",
    borderRadius: UI.radius.hero,
    minHeight: "640px",
    display: "grid",
    alignItems: "center",
    padding: "30px 22px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.14)"
  },

  bgGlowOne: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(10,191,184,0.18), rgba(10,191,184,0))"
  },

  bgGlowTwo: {
    position: "absolute",
    bottom: "-120px",
    right: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(240,90,40,0.16), rgba(240,90,40,0))"
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    opacity: 0.18,
    backgroundImage:
      "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 85%)"
  },

  heroGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "28px"
  },

  heroTextCol: {
    display: "grid",
    gap: "18px"
  },

  heroBadge: {
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: UI.radius.pill,
    background: "rgba(10,191,184,0.10)",
    color: UI.colors.tealDark,
    border: "1px solid rgba(10,191,184,0.22)",
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    letterSpacing: "0.04em"
  },

  heroTitle: {
    margin: 0,
    fontSize: UI.type.hero,
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    color: UI.colors.ink,
    fontWeight: 900,
    maxWidth: "650px"
  },

  heroAccent: {
    color: UI.colors.teal
  },

  heroSub: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.95,
    color: "#556070",
    maxWidth: "620px"
  },

  heroActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  heroStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },

  statCard: {
    minWidth: "110px",
    padding: "12px 14px",
    borderRadius: UI.radius.lg,
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    display: "grid",
    gap: "4px"
  },

  statValue: {
    color: UI.colors.ink,
    fontSize: "24px",
    fontWeight: 900
  },

  statLabel: {
    color: "#6b7280",
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  heroVisualCol: {
    position: "relative",
    minHeight: "390px",
    display: "grid",
    placeItems: "center"
  },

  floatingTopCard: {
    position: "absolute",
    top: "8px",
    right: "0",
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(14px)",
    borderRadius: UI.radius.lg,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)",
    border: "1px solid rgba(148,163,184,0.16)"
  },

  floatingBottomCard: {
    position: "absolute",
    bottom: "6px",
    left: "0",
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(14px)",
    borderRadius: UI.radius.lg,
    padding: "12px 14px",
    display: "grid",
    gap: "4px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)",
    border: "1px solid rgba(148,163,184,0.16)"
  },

  miniIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0ABFB8, #3BA5F5)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontSize: "18px"
  },

  miniTextWrap: {
    display: "grid",
    gap: "2px"
  },

  miniStrong: {
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    color: UI.colors.ink
  },

  miniSmall: {
    fontSize: UI.type.caption,
    color: "#7b8190"
  },

  stars: {
    color: UI.colors.gold,
    letterSpacing: "2px",
    fontSize: UI.type.bodySm
  },

  mainCard: {
    width: "100%",
    maxWidth: "360px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(16px)",
    borderRadius: UI.radius.xxl,
    overflow: "hidden",
    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.14)",
    border: "1px solid rgba(148,163,184,0.16)",
    display: "grid",
    gap: "0"
  },

  mainCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "16px 18px 0"
  },

  mainCardPill: {
    width: "fit-content",
    padding: "5px 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(10,191,184,0.10)",
    color: UI.colors.tealDark,
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  mainCardStatus: {
    padding: "5px 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(16,185,129,0.12)",
    color: "#047857",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  mainCardBody: {
    padding: "18px",
    display: "grid",
    gap: "14px"
  },

  productMediaBox: {
    borderRadius: UI.radius.xl,
    background: "linear-gradient(135deg, #eef7ff 0%, #fef3e8 100%)",
    padding: "18px",
    display: "grid",
    placeItems: "center"
  },

  productMediaInner: {
    width: "100%",
    minHeight: "180px",
    borderRadius: UI.radius.lg,
    background: "rgba(255,255,255,0.62)",
    display: "grid",
    placeItems: "center",
    fontSize: "64px",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)"
  },

  productInfo: {
    display: "grid",
    gap: "10px"
  },

  productTitle: {
    margin: 0,
    color: UI.colors.ink,
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: 1.45
  },

  productText: {
    margin: 0,
    color: "#667085",
    fontSize: UI.type.bodySm,
    lineHeight: 1.8
  },

  productMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  metaChip: {
    padding: "6px 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(15,23,42,0.05)",
    color: UI.colors.navy,
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  mainCardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px 18px"
  },

  footerPriceWrap: {
    display: "grid",
    gap: "4px"
  },

  footerPriceLabel: {
    color: "#8b93a3",
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  footerPrice: {
    color: UI.colors.coral,
    fontWeight: 900,
    fontSize: "20px"
  },

  footerAction: {
    width: "42px",
    height: "42px",
    borderRadius: UI.radius.md,
    background: UI.colors.ink,
    color: UI.colors.white,
    display: "grid",
    placeItems: "center",
    fontSize: "22px",
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)"
  }
};
