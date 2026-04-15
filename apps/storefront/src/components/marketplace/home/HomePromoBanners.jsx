import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomePromoBanners() {
  return (
    <section style={s.grid} dir="rtl">
      <div style={{ ...s.card, ...s.cardPrimary }}>
        <div style={s.cardGlow} />
        <div style={s.iconBox}>🏷️</div>

        <div style={s.content}>
          <div style={s.kicker}>مختارات رحبة</div>
          <h3 style={s.title}>عروض ومنتجات بارزة بتجربة أوضح وأكثر احترافية</h3>
          <p style={s.text}>
            تصفح أبرز المنتجات والعروض داخل رحبة، مع عرض أفضل، هيكلة أوضح،
            وتجربة اكتشاف تساعدك تلقى ما تحتاج بسرعة أكبر.
          </p>

          <Link to="/products?sort=featured" style={s.ctaLight}>
            اكتشف العروض الآن
            <span style={s.ctaArrow}>←</span>
          </Link>
        </div>
      </div>

      <div style={{ ...s.card, ...s.cardWarm }}>
        <div style={s.cardGlow} />
        <div style={s.iconBox}>🚀</div>

        <div style={s.content}>
          <div style={s.kicker}>للباعة</div>
          <h3 style={s.title}>ابدأ البيع ووسّع حضورك أمام مشترين من مختلف المدن</h3>
          <p style={s.text}>
            افتح متجرك على رحبة وابدأ عرض منتجاتك داخل منصة منظمة، واضحة،
            ومصممة لتجربة بيع أسهل وأكثر جدية.
          </p>

          <Link to="/auth" style={s.ctaGlass}>
            ابدأ الآن
            <span style={s.ctaArrow}>←</span>
          </Link>
        </div>
      </div>

      <div style={{ ...s.card, ...s.cardCool }}>
        <div style={s.cardGlow} />
        <div style={s.iconBox}>📦</div>

        <div style={s.content}>
          <div style={s.kicker}>خدمة أفضل</div>
          <h3 style={s.title}>متابعة الطلبات والشحن بطريقة أبسط وأكثر وضوحاً</h3>
          <p style={s.text}>
            تجربة أفضل لإدارة الطلبات، متابعة الشحن، والوصول إلى معلومات أوضح
            حول حالة الشراء داخل المنصة.
          </p>

          <Link to="/help" style={s.ctaGlass}>
            اعرف المزيد
            <span style={s.ctaArrow}>←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const s = {
  grid: {
    display: "grid",
    gap: "14px",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: UI.radius.xxl,
    minHeight: "240px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxShadow: "0 24px 54px rgba(11,15,26,0.12)",
  },

  cardPrimary: {
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 42%, #0abfb8 100%)",
  },

  cardWarm: {
    background: "linear-gradient(135deg, #f59e0b 0%, #f05a28 100%)",
  },

  cardCool: {
    background: "linear-gradient(135deg, #6c3fe8 0%, #3ba5f5 100%)",
  },

  cardGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.20), transparent 40%)",
    pointerEvents: "none",
  },

  iconBox: {
    position: "absolute",
    top: "18px",
    left: "18px",
    width: "68px",
    height: "68px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    fontSize: "34px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 8px 24px rgba(11,15,26,0.12)",
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "10px",
  },

  kicker: {
    color: "rgba(255,255,255,0.76)",
    fontSize: UI.type.caption,
    fontWeight: 900,
    letterSpacing: "0.05em",
  },

  title: {
    margin: 0,
    color: UI.colors.white,
    fontSize: "24px",
    lineHeight: 1.35,
    fontWeight: 900,
    maxWidth: "560px",
  },

  text: {
    margin: 0,
    color: "rgba(255,255,255,0.84)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.88,
    maxWidth: "620px",
  },

  ctaLight: {
    width: "fit-content",
    marginTop: "2px",
    minHeight: "44px",
    padding: "0 14px",
    textDecoration: "none",
    color: "#0d2c54",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: UI.radius.pill,
    background: "#ffffff",
    boxShadow: "0 10px 24px rgba(11,15,26,0.14)",
  },

  ctaGlass: {
    width: "fit-content",
    marginTop: "2px",
    minHeight: "44px",
    padding: "0 14px",
    textDecoration: "none",
    color: UI.colors.white,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: UI.radius.pill,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(6px)",
  },

  ctaArrow: {
    fontSize: "14px",
    lineHeight: 1,
  },
};
