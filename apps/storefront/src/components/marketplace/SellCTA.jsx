import { SELLER_PORTAL_URL } from "../../lib/config";

const perks = [
  { icon: "💬", label: "مراسلة مباشرة" },
  { icon: "📊", label: "لوحة تحكم للمبيعات" },
  { icon: "📦", label: "إضافة منتجات بسهولة" },
  { icon: "🏪", label: "متجر مجاني" },
];

export default function SellCTA() {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.overlay} />

      <div style={s.content}>
        <div style={s.eyebrow}>للباعة</div>

        <h2 style={s.title}>ابدأ البيع على رحبة</h2>

        <p style={s.sub}>
          أنشئ متجرك، أضف منتجاتك، تابع الطلبات،
          ووسّع نشاطك التجاري بسهولة داخل منصة مغربية حديثة ومتكاملة.
        </p>

        <div style={s.perks}>
          {perks.map((p) => (
            <div key={p.label} style={s.perk}>
              <span>{p.icon}</span>
              <span style={s.perkLabel}>{p.label}</span>
            </div>
          ))}
        </div>

        <a
          href={SELLER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={s.btn}
        >
          دخول بوابة البائع
        </a>
      </div>

      <div style={s.deco} aria-hidden="true">
        <div style={s.decoInner}>🏷️</div>
      </div>
    </section>
  );
}

const s = {
  section: {
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "24px",
    alignItems: "center",
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 55%, #17B890 100%)",
    borderRadius: "24px",
    padding: "28px 24px",
    color: "#fff",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 28%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 22%)",
    pointerEvents: "none",
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "14px",
    textAlign: "right",
  },

  eyebrow: {
    display: "inline-block",
    width: "fit-content",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "999px",
    padding: "5px 12px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: 900,
    lineHeight: 1.2,
    color: "#fff",
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.88)",
    fontSize: "15px",
    lineHeight: 1.9,
    maxWidth: "620px",
  },

  perks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  perk: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.14)",
    color: "#F8FAFC",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
    backdropFilter: "blur(6px)",
  },

  perkLabel: {
    color: "rgba(255,255,255,0.95)",
  },

  btn: {
    display: "inline-block",
    width: "fit-content",
    textDecoration: "none",
    padding: "14px 22px",
    borderRadius: "16px",
    background: "#FFFFFF",
    color: "#0B3D91",
    fontWeight: 900,
    fontSize: "15px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
  },

  deco: {
    display: "grid",
    placeItems: "center",
    position: "relative",
    zIndex: 1,
  },

  decoInner: {
    width: "88px",
    height: "88px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    fontSize: "40px",
    backdropFilter: "blur(10px)",
  },
};
