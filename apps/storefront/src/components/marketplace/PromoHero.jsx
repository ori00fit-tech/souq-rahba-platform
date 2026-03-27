import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../../lib/config";

const metrics = [
  { value: "متعدد الباعة", label: "سوق منظم" },
  { value: "منتجات موثوقة", label: "اختيارات جاهزة" },
  { value: "تجربة مغربية", label: "دفع وتسوق أسهل" }
];

export default function PromoHero() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.overlay} />
      <div style={s.orbOne} />
      <div style={s.orbTwo} />

      <div style={s.grid}>
        <div style={s.content}>
          <div style={s.eyebrow}>رحبة • منصة تجارة مغربية حديثة</div>

          <h1 style={s.title}>
            اكتشف منتجات موثوقة من باعة معتمدين عبر المغرب
          </h1>

          <p style={s.sub}>
            تسوّق الإلكترونيات، الأزياء، مستلزمات المنزل، الأدوات وغيرها داخل
            تجربة حديثة تجمع بين الثقة، السرعة، وسهولة الوصول إلى الباعة
            والمنتجات.
          </p>

          <div style={s.actions}>
            <Link to="/products" style={s.primaryBtn}>
              تصفّح السوق
            </Link>

            <a
              href={SELLER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={s.secondaryBtn}
            >
              ابدأ البيع
            </a>
          </div>

          <div style={s.metrics}>
            {metrics.map((item) => (
              <div key={item.label} style={s.metricCard}>
                <strong style={s.metricValue}>{item.value}</strong>
                <span style={s.metricLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.visualCard}>
          <div style={s.visualPanel}>
            <div style={s.visualTop}>
              <span style={s.visualChip}>RAHBA</span>
              <span style={s.visualMuted}>Marketplace</span>
            </div>

            <div style={s.visualBody}>
              <div style={s.visualMainCard}>
                <div style={s.visualBadge}>مميز</div>
                <div style={s.visualTitle}>منتجات مختارة</div>
                <div style={s.visualText}>
                  وصول أسرع إلى المنتجات والباعة داخل واجهة واضحة ومريحة.
                </div>
              </div>

              <div style={s.visualMiniGrid}>
                <div style={s.visualMiniCard}>فئات رئيسية</div>
                <div style={s.visualMiniCard}>باعة موثقون</div>
                <div style={s.visualMiniCard}>طلبات أوضح</div>
                <div style={s.visualMiniCard}>تصفح أسرع</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  wrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "26px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 58%, #17B890 100%)",
    boxShadow: "0 22px 50px rgba(15, 23, 42, 0.18)"
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 26%)",
    pointerEvents: "none"
  },

  orbOne: {
    position: "absolute",
    top: "-40px",
    left: "-30px",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(10px)"
  },

  orbTwo: {
    position: "absolute",
    bottom: "-60px",
    right: "-20px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(12px)"
  },

  grid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
    gap: "22px",
    alignItems: "stretch"
  },

  content: {
    display: "grid",
    gap: "16px",
    textAlign: "right"
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
    backdropFilter: "blur(8px)"
  },

  title: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "clamp(30px, 6vw, 56px)",
    lineHeight: 1.12,
    fontWeight: 900,
    letterSpacing: "-0.02em"
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "clamp(15px, 3.2vw, 19px)",
    lineHeight: 1.9,
    maxWidth: "720px"
  },

  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },

  primaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: "16px",
    background: "#FFFFFF",
    color: "#0B3D91",
    fontWeight: 900,
    fontSize: "15px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.14)"
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
    backdropFilter: "blur(8px)"
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "6px"
  },

  metricCard: {
    display: "grid",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)"
  },

  metricValue: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: 900
  },

  metricLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "12px",
    fontWeight: 700
  },

  visualCard: {
    display: "grid"
  },

  visualPanel: {
    height: "100%",
    borderRadius: "26px",
    padding: "18px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    display: "grid",
    gap: "14px"
  },

  visualTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  visualChip: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 900
  },

  visualMuted: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    fontWeight: 700
  },

  visualBody: {
    display: "grid",
    gap: "12px"
  },

  visualMainCard: {
    display: "grid",
    gap: "8px",
    borderRadius: "20px",
    background: "#fff",
    padding: "18px",
    color: "#16356b"
  },

  visualBadge: {
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eef4ff",
    border: "1px solid #c7d7f8",
    fontSize: "12px",
    fontWeight: 900
  },

  visualTitle: {
    fontSize: "18px",
    fontWeight: 900
  },

  visualText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.8
  },

  visualMiniGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  visualMiniCard: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    textAlign: "center"
  }
};
