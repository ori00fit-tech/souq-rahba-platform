import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomeHero() {
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

const s = {
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
  }
};
