import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomePromoBanners() {
  return (
    <section style={s.grid} dir="rtl">
      <div style={{ ...s.card, ...s.cardOne }}>
        <div style={s.glow} />
        <div style={s.iconWrap}>🏷️</div>
        <div style={s.content}>
          <div style={s.kicker}>عروض مميزة</div>
          <h3 style={s.title}>أفضل الاختيارات والعروض داخل رحبة</h3>
          <p style={s.text}>
            اكتشف المنتجات الأكثر بروزاً داخل المنصة، مع عرض أوضح وتجربة تصفح
            أكثر أناقة.
          </p>
          <Link to="/products?sort=featured" style={s.cta}>
            اكتشف الآن →
          </Link>
        </div>
      </div>

      <div style={{ ...s.card, ...s.cardTwo }}>
        <div style={s.glow} />
        <div style={s.iconWrap}>🚀</div>
        <div style={s.content}>
          <div style={s.kicker}>للبائعين</div>
          <h3 style={s.title}>ابدأ البيع ووسّع حضورك داخل رحبة</h3>
          <p style={s.text}>
            أنشئ متجرك وابدأ عرض منتجاتك أمام مشترين من مدن متعددة داخل المغرب.
          </p>
          <Link to="/auth" style={s.cta}>
            سجل الآن →
          </Link>
        </div>
      </div>

      <div style={{ ...s.card, ...s.cardThree }}>
        <div style={s.glow} />
        <div style={s.iconWrap}>📦</div>
        <div style={s.content}>
          <div style={s.kicker}>خدمة أوضح</div>
          <h3 style={s.title}>تجربة شحن ومتابعة طلبات أفضل</h3>
          <p style={s.text}>
            تابع الطلبات بسهولة، واعرف حالة الشحن بطريقة أبسط وأكثر وضوحاً.
          </p>
          <Link to="/help" style={s.cta}>
            اعرف المزيد →
          </Link>
        </div>
      </div>
    </section>
  );
}

const s = {
  grid: {
    display: "grid",
    gap: "14px"
  },

  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: UI.radius.xxl,
    minHeight: "230px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxShadow: "0 22px 50px rgba(15, 23, 42, 0.12)"
  },

  cardOne: {
    background: "linear-gradient(135deg, #0b2d57 0%, #0abfb8 100%)"
  },

  cardTwo: {
    background: "linear-gradient(135deg, #f59e0b 0%, #f05a28 100%)"
  },

  cardThree: {
    background: "linear-gradient(135deg, #6c3fe8 0%, #3ba5f5 100%)"
  },

  glow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.20), transparent 42%)"
  },

  iconWrap: {
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
    border: "1px solid rgba(255,255,255,0.18)"
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "10px"
  },

  kicker: {
    color: "rgba(255,255,255,0.76)",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "0.05em"
  },

  title: {
    margin: 0,
    color: UI.colors.white,
    fontSize: "24px",
    lineHeight: 1.35,
    fontWeight: 900,
    maxWidth: "520px"
  },

  text: {
    margin: 0,
    color: "rgba(255,255,255,0.82)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.85,
    maxWidth: "580px"
  },

  cta: {
    width: "fit-content",
    marginTop: "2px",
    textDecoration: "none",
    color: UI.colors.white,
    fontWeight: 800,
    padding: "9px 14px",
    borderRadius: UI.radius.pill,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(6px)"
  }
};
