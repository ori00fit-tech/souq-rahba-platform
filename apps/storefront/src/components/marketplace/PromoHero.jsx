import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../../lib/config";

const T = {
  white: "#ffffff",
  whiteSoft: "rgba(255,255,255,0.88)",
  whiteMuted: "rgba(255,255,255,0.78)",
  line: "rgba(255,255,255,0.18)",
  glass: "rgba(255,255,255,0.12)",
  shadow: "rgba(15, 23, 42, 0.18)",
  primaryText: "#0B3D91"
};

const trustPoints = [
  "باعة داخل رحبة",
  "الدفع عند الاستلام",
  "تتبع الطلبات",
  "واجهة أوضح للمستخدم المغربي"
];

export default function PromoHero() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.overlay} />
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      <div style={s.content}>
        <div style={s.topRow}>
          <div style={s.eyebrow}>رحبة • السوق الإلكتروني المغربي</div>
          <div style={s.marketBadge}>🇲🇦 Moroccan Marketplace</div>
        </div>

        <div style={s.mainGrid}>
          <div style={s.textCol}>
            <h2 style={s.title}>
              تسوق بسهولة من بائعين
              <br />
              ومتاجر داخل رحبة
            </h2>

            <p style={s.sub}>
              منصة مغربية حديثة تجعل الشراء أوضح: منتج، بائع، سعر، وثقة —
              في تجربة أنظف وأسرع للمستخدم المحلي.
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

          <div style={s.sideCol}>
            <div style={s.trustCard}>
              <div style={s.trustTitle}>لماذا هذا السوق مختلف؟</div>

              <div style={s.trustList}>
                {trustPoints.map((item) => (
                  <div key={item} style={s.trustItem}>
                    <span style={s.trustCheck}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <strong style={s.statValue}>COD</strong>
                <span style={s.statLabel}>الدفع عند الاستلام</span>
              </div>

              <div style={s.statBox}>
                <strong style={s.statValue}>Trust</strong>
                <span style={s.statLabel}>بائع أوضح للمشتري</span>
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
    borderRadius: "28px",
    padding: "24px 20px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 55%, #17B890 100%)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
    display: "grid",
    alignItems: "center"
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.10), transparent 24%)",
    pointerEvents: "none"
  },

  glowOne: {
    position: "absolute",
    top: "-40px",
    left: "-40px",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    filter: "blur(28px)",
    pointerEvents: "none"
  },

  glowTwo: {
    position: "absolute",
    bottom: "-50px",
    right: "-30px",
    width: "200px",
    height: "200px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(28px)",
    pointerEvents: "none"
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "18px"
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  eyebrow: {
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: `1px solid ${T.line}`,
    color: T.white,
    fontSize: "13px",
    fontWeight: 800,
    backdropFilter: "blur(8px)"
  },

  marketBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: `1px solid ${T.line}`,
    color: T.whiteSoft,
    fontSize: "12px",
    fontWeight: 800
  },

  mainGrid: {
    display: "grid",
    gap: "18px"
  },

  textCol: {
    display: "grid",
    gap: "14px",
    textAlign: "right"
  },

  title: {
    margin: 0,
    color: T.white,
    fontSize: "clamp(28px, 5.8vw, 48px)",
    lineHeight: 1.16,
    fontWeight: 900,
    letterSpacing: "-0.02em"
  },

  sub: {
    margin: 0,
    color: T.whiteSoft,
    fontSize: "clamp(15px, 3vw, 18px)",
    lineHeight: 1.9,
    maxWidth: "680px"
  },

  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-start"
  },

  primaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: "16px",
    background: T.white,
    color: T.primaryText,
    fontWeight: 900,
    fontSize: "15px",
    boxShadow: `0 10px 24px ${T.shadow}`
  },

  secondaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: "16px",
    background: T.glass,
    color: T.white,
    border: `1px solid ${T.line}`,
    fontWeight: 900,
    fontSize: "15px",
    backdropFilter: "blur(8px)"
  },

  sideCol: {
    display: "grid",
    gap: "12px"
  },

  trustCard: {
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.12)",
    border: `1px solid ${T.line}`,
    backdropFilter: "blur(10px)",
    display: "grid",
    gap: "12px"
  },

  trustTitle: {
    color: T.white,
    fontSize: "16px",
    fontWeight: 900
  },

  trustList: {
    display: "grid",
    gap: "8px"
  },

  trustItem: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    color: T.whiteSoft,
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.7
  },

  trustCheck: {
    width: "20px",
    height: "20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    display: "grid",
    placeItems: "center",
    color: T.white,
    fontSize: "12px",
    fontWeight: 900,
    flexShrink: 0
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  statBox: {
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.10)",
    border: `1px solid ${T.line}`,
    backdropFilter: "blur(8px)",
    display: "grid",
    gap: "4px"
  },

  statValue: {
    color: T.white,
    fontSize: "18px",
    fontWeight: 900
  },

  statLabel: {
    color: T.whiteMuted,
    fontSize: "12px",
    lineHeight: 1.7,
    fontWeight: 700
  }
};
