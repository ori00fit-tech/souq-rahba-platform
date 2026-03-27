import { SELLER_PORTAL_URL } from "../../lib/config";

const perks = [
  { label: "لوحة تحكم للمبيعات" },
  { label: "إضافة منتجات بسهولة" },
  { label: "متجر جاهز للعرض" },
  { label: "إدارة الطلبات" }
];

export default function SellCTA() {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.left}>
        <div style={s.eyebrow}>للباعة</div>

        <h2 style={s.title}>ابدأ البيع على رحبة</h2>

        <p style={s.sub}>
          أنشئ متجرك، أضف منتجاتك، وتابع الطلبات داخل تجربة منظمة تساعدك
          على الظهور بشكل أفضل أمام المشترين داخل المنصة.
        </p>

        <div style={s.perks}>
          {perks.map((p) => (
            <div key={p.label} style={s.perk}>
              <span style={s.perkDot} />
              <span style={s.perkLabel}>{p.label}</span>
            </div>
          ))}
        </div>

        <div style={s.actions}>
          <a
            href={SELLER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={s.primaryBtn}
          >
            دخول بوابة البائع
          </a>

          <a
            href={SELLER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={s.secondaryBtn}
          >
            افتح متجرك
          </a>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.panel}>
          <div style={s.panelTop}>
            <span style={s.panelChip}>SELLER READY</span>
            <span style={s.panelMuted}>RAHBA</span>
          </div>

          <div style={s.panelBody}>
            <div style={s.panelCard}>
              <strong style={s.panelValue}>واجهة أبسط</strong>
              <span style={s.panelText}>إدارة أوضح للمنتجات والطلبات</span>
            </div>
            <div style={s.panelCard}>
              <strong style={s.panelValue}>ظهور أقوى</strong>
              <span style={s.panelText}>صفحات عرض ومتاجر قابلة للتطوير</span>
            </div>
            <div style={s.panelCard}>
              <strong style={s.panelValue}>تجربة موحدة</strong>
              <span style={s.panelText}>من المنتج إلى الطلب داخل منصة واحدة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)",
    gap: "18px",
    alignItems: "stretch",
    background: "#fff",
    border: "1.5px solid #ddd5c2",
    borderRadius: "28px",
    padding: "22px",
    boxShadow: "0 10px 24px rgba(22,53,107,0.08)"
  },

  left: {
    display: "grid",
    gap: "14px",
    textAlign: "right"
  },

  eyebrow: {
    display: "inline-block",
    width: "fit-content",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.04em",
    color: "#1d4ed8",
    background: "#eef4ff",
    border: "1px solid #c7d7f8",
    borderRadius: "999px",
    padding: "6px 12px"
  },

  title: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: 900,
    lineHeight: 1.15,
    color: "#16356b"
  },

  sub: {
    margin: 0,
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.9,
    maxWidth: "640px"
  },

  perks: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px"
  },

  perk: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#faf8f2",
    border: "1px solid #e5dcc9",
    borderRadius: "14px",
    padding: "12px"
  },

  perkDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #17B890 100%)",
    flexShrink: 0
  },

  perkLabel: {
    color: "#16356b",
    fontSize: "13px",
    fontWeight: 800
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  primaryBtn: {
    display: "inline-grid",
    placeItems: "center",
    minHeight: "44px",
    padding: "0 18px",
    borderRadius: "14px",
    textDecoration: "none",
    background: "#16356b",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 900
  },

  secondaryBtn: {
    display: "inline-grid",
    placeItems: "center",
    minHeight: "44px",
    padding: "0 18px",
    borderRadius: "14px",
    textDecoration: "none",
    background: "#f8f6f0",
    border: "1.5px solid #ddd5c2",
    color: "#16356b",
    fontSize: "14px",
    fontWeight: 900
  },

  right: {
    display: "grid"
  },

  panel: {
    height: "100%",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 58%, #17B890 100%)",
    padding: "18px",
    display: "grid",
    gap: "14px",
    color: "#fff",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)"
  },

  panelTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  panelChip: {
    fontSize: "11px",
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)"
  },

  panelMuted: {
    fontSize: "12px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.84)"
  },

  panelBody: {
    display: "grid",
    gap: "10px"
  },

  panelCard: {
    display: "grid",
    gap: "4px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "14px"
  },

  panelValue: {
    fontSize: "15px",
    fontWeight: 900
  },

  panelText: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.88)"
  }
};
