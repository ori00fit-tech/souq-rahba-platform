import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../../lib/config";

export default function PromoHero() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.overlay} />

      <div style={s.content}>
        <div style={s.eyebrow}>رحبة • السوق الإلكتروني المغربي</div>

        <h1 style={s.title}>
          اكتشف منتجات موثوقة من باعة معتمدين عبر المغرب
        </h1>

        <p style={s.sub}>
          تسوّق الإلكترونيات، الأزياء، مستلزمات المنزل، الأدوات وغيرها
          في منصة عصرية تجمع بين الجودة والثقة وسهولة الاستخدام.
        </p>

        <div style={s.actions}>
          <a
            href={SELLER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={s.primaryBtn}
          >
            ابدأ البيع
          </a>

          <Link to="/products" style={s.secondaryBtn}>
            تصفّح السوق
          </Link>
        </div>
      </div>
    </section>
  );
}

const s = {
  wrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    padding: "28px 22px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 55%, #17B890 100%)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
    minHeight: "320px",
    display: "grid",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.10), transparent 24%)",
    pointerEvents: "none",
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "16px",
    textAlign: "right",
    maxWidth: "760px",
    marginRight: "auto",
  },

  eyebrow: {
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#F8FAFC",
    fontSize: "13px",
    fontWeight: 800,
    backdropFilter: "blur(8px)",
  },

  title: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "clamp(30px, 6vw, 56px)",
    lineHeight: 1.14,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.88)",
    fontSize: "clamp(15px, 3.2vw, 19px)",
    lineHeight: 1.9,
    maxWidth: "680px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  primaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: "16px",
    background: "#FFFFFF",
    color: "#0B3D91",
    fontWeight: 900,
    fontSize: "15px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.14)",
  },

  secondaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.28)",
    fontWeight: 900,
    fontSize: "15px",
    backdropFilter: "blur(8px)",
  },
};
