import SectionHead from "./SectionHead";

const T = { navy: "#16356b", sand: "#f5f1e8", border: "#ddd5c2", shadow: "rgba(22,53,107,0.08)" };

const items = [
  {
    icon: "📈",
    title: "سوق متنامٍ",
    text: "وجهة موحدة للمنتجات والمتاجر والفئات المختلفة عبر المغرب.",
    accent: "#0f766e",
    bg: "#f0fdfa",
    bdr: "#99f6e4",
  },
  {
    icon: "🔒",
    title: "دفع آمن",
    text: "تجربة طلب واضحة مع حماية للحساب وتتبع سهل للطلبات.",
    accent: "#1d4ed8",
    bg: "#eff6ff",
    bdr: "#bfdbfe",
  },
  {
    icon: "✅",
    title: "باعة موثوقون",
    text: "اشترِ من باعة خضعوا للمراجعة والتحقق داخل المنصة.",
    accent: "#16a34a",
    bg: "#f0fdf4",
    bdr: "#bbf7d0",
  },
];

export default function TrustSection() {
  return (
    <section style={s.section} dir="rtl">
      <SectionHead
        title="لماذا رحبة؟"
        sub="منصة تجمع بين المشترين والبائعين الموثوقين في سوق إلكتروني مغربي حديث وآمن."
      />

      <div style={s.grid}>
        {items.map((item) => (
          <article key={item.title} style={s.card}>
            <div style={{ ...s.iconWrap, background: item.bg, border: `1px solid ${item.bdr}` }}>
              <span style={s.icon}>{item.icon}</span>
            </div>
            <div style={s.content}>
              <h3 style={{ ...s.title, color: item.accent }}>{item.title}</h3>
              <p style={s.text}>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: { display: "grid", gap: "18px" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },

  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "18px",
    padding: "20px",
    display: "grid",
    gap: "14px",
    boxShadow: `0 4px 16px ${T.shadow}`,
    textAlign: "right",
  },

  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    justifySelf: "start",
  },

  icon: { fontSize: "22px", lineHeight: 1 },

  content: {
    display: "grid",
    gap: "6px",
  },

  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
  },

  text: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.8,
  },
};
