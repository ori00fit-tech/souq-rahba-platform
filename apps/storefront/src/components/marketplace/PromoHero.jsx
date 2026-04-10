import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../../lib/config";
import { UI } from "./uiTokens";

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
    borderRadius: UI.radius.hero,
    padding: "24px 20px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 55%, #17B890 100%)",
    boxShadow: UI.shadow.hero,
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
    borderRadius: UI.radius.pill,
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
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.08)",
    filter: "blur(28px)",
    pointerEvents: "none"
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: UI.spacing.sectionGap
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
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: UI.colors.white,
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    backdropFilter: "blur(8px)"
  },

  marketBadge: {
    padding: "8px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.88)",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  mainGrid: {
    display: "grid",
    gap: UI.spacing.sectionGap
  },

  textCol: {
    display: "grid",
    gap: "14px",
    textAlign: "right"
  },

  title: {
    margin: 0,
    color: UI.colors.white,
    fontSize: "clamp(28px, 5.8vw, 48px)",
    lineHeight: 1.16,
    fontWeight: 900,
    letterSpacing: "-0.02em"
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.88)",
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
    borderRadius: UI.radius.lg,
    background: UI.colors.white,
    color: "#0B3D91",
    fontWeight: 900,
    fontSize: "15px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)"
  },

  secondaryBtn: {
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: UI.radius.lg,
    background: "rgba(255,255,255,0.12)",
    color: UI.colors.white,
    border: "1px solid rgba(255,255,255,0.18)",
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
    borderRadius: UI.radius.xxl,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    display: "grid",
    gap: "12px"
  },

  trustTitle: {
    color: UI.colors.white,
    fontSize: UI.type.titleSm,
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
    color: "rgba(255,255,255,0.88)",
    fontSize: UI.type.bodySm,
    fontWeight: 700,
    lineHeight: 1.7
  },

  trustCheck: {
    width: "20px",
    height: "20px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.16)",
    display: "grid",
    placeItems: "center",
    color: UI.colors.white,
    fontSize: UI.type.caption,
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
    borderRadius: UI.radius.xl,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)",
    display: "grid",
    gap: "4px"
  },

  statValue: {
    color: UI.colors.white,
    fontSize: "18px",
    fontWeight: 900
  },

  statLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: UI.type.caption,
    lineHeight: 1.7,
    fontWeight: 700
  }
};
