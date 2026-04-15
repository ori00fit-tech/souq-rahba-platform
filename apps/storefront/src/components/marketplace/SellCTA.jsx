import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../../lib/config";
import { UI } from "./uiTokens";

export default function SellCTA() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      <div style={s.content}>
        <div style={s.textCol}>
          <div style={s.badge}>SELL ON RAHBA</div>

          <h2 style={s.title}>
            افتح متجرك على رحبة
            <br />
            <span style={s.titleAccent}>وابدأ البيع بشكل أكثر احترافية</span>
          </h2>

          <p style={s.text}>
            رحبة تمنحك واجهة أوضح لعرض منتجاتك، تجربة منظمة لإدارة الحضور داخل
            المنصة، وفرصة للوصول إلى مشترين من مدن متعددة داخل المغرب.
          </p>

          <div style={s.featureList}>
            <div style={s.featureItem}>
              <span style={s.featureDot}>✦</span>
              <span>عرض منتجاتك داخل منصة منظمة وسهلة التصفح</span>
            </div>
            <div style={s.featureItem}>
              <span style={s.featureDot}>✦</span>
              <span>الوصول إلى مشترين بشكل أوضح وأكثر احترافية</span>
            </div>
            <div style={s.featureItem}>
              <span style={s.featureDot}>✦</span>
              <span>واجهة مناسبة للنمو والتوسع التجاري</span>
            </div>
          </div>

          <div style={s.actions}>
            <a
              href={SELLER_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              style={s.primaryBtn}
            >
              الدخول إلى بوابة البائع
            </a>

            <Link to="/sellers" style={s.secondaryBtn}>
              تصفح الباعة الحاليين
            </Link>
          </div>
        </div>

        <div style={s.visualCol}>
          <div style={s.visualCard}>
            <div style={s.visualTop}>
              <div style={s.visualPill}>RAHBA</div>
              <div style={s.visualStatus}>Seller Ready</div>
            </div>

            <div style={s.visualMain}>
              <div style={s.visualIconBox}>🏪</div>

              <div style={s.visualBody}>
                <h3 style={s.visualTitle}>متجرك داخل رحبة</h3>
                <p style={s.visualText}>
                  مساحة واضحة لعرض المنتجات، بناء الثقة، وتحسين الحضور التجاري
                  داخل marketplace حديث.
                </p>

                <div style={s.visualChips}>
                  <span style={s.visualChip}>واجهة أوضح</span>
                  <span style={s.visualChip}>وصول أفضل</span>
                  <span style={s.visualChip}>تجربة حديثة</span>
                </div>
              </div>
            </div>

            <div style={s.visualFooter}>
              <div style={s.visualMetric}>
                <strong style={s.metricValue}>+1.2k</strong>
                <span style={s.metricLabel}>بائع نشط</span>
              </div>
              <div style={s.visualMetric}>
                <strong style={s.metricValue}>+24k</strong>
                <span style={s.metricLabel}>منتج</span>
              </div>
              <div style={s.visualMetric}>
                <strong style={s.metricValue}>+15</strong>
                <span style={s.metricLabel}>مدينة</span>
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
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 45%, #0abfb8 100%)",
    padding: "28px 20px",
    boxShadow: "0 24px 60px rgba(11,15,26,0.14)",
    color: "#fff",
  },

  glowOne: {
    position: "absolute",
    top: "-120px",
    left: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 42%)",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    bottom: "-120px",
    right: "-60px",
    width: "300px",
    height: "300px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 42%)",
    pointerEvents: "none",
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "24px",
  },

  textCol: {
    display: "grid",
    gap: "14px",
  },

  badge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },

  title: {
    margin: 0,
    color: "#fff",
    fontSize: "clamp(2rem, 5vw, 3.6rem)",
    lineHeight: 1.15,
    fontWeight: 900,
  },

  titleAccent: {
    color: "#F5C855",
  },

  text: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "15px",
    lineHeight: 1.95,
    maxWidth: "680px",
  },

  featureList: {
    display: "grid",
    gap: "10px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.8,
  },

  featureDot: {
    color: "#F5C855",
    fontWeight: 900,
    flexShrink: 0,
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "4px",
  },

  primaryBtn: {
    minHeight: "48px",
    padding: "0 16px",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#0d2c54",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: "0 10px 24px rgba(11,15,26,0.14)",
  },

  secondaryBtn: {
    minHeight: "48px",
    padding: "0 16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)",
  },

  visualCol: {
    display: "grid",
  },

  visualCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: UI.radius.xxl,
    padding: "18px",
    display: "grid",
    gap: "14px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 16px 36px rgba(11,15,26,0.12)",
  },

  visualTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  visualPill: {
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.16)",
    display: "inline-flex",
    alignItems: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: "12px",
  },

  visualStatus: {
    color: "rgba(255,255,255,0.84)",
    fontSize: "12px",
    fontWeight: 700,
  },

  visualMain: {
    display: "grid",
    gap: "14px",
  },

  visualIconBox: {
    width: "68px",
    height: "68px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    fontSize: "34px",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  visualBody: {
    display: "grid",
    gap: "8px",
  },

  visualTitle: {
    margin: 0,
    color: "#fff",
    fontSize: "22px",
    lineHeight: 1.35,
    fontWeight: 900,
  },

  visualText: {
    margin: 0,
    color: "rgba(255,255,255,0.84)",
    fontSize: "14px",
    lineHeight: 1.88,
  },

  visualChips: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  visualChip: {
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    display: "inline-flex",
    alignItems: "center",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
  },

  visualFooter: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  visualMetric: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: UI.radius.lg,
    padding: "12px 10px",
    display: "grid",
    gap: "4px",
    textAlign: "center",
  },

  metricValue: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: 900,
    lineHeight: 1.1,
  },

  metricLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: "12px",
    fontWeight: 700,
  },
};
