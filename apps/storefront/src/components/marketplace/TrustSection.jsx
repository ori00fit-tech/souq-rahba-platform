import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b", sand: "#f5f1e8", border: "#ddd5c2", shadow: "rgba(22,53,107,0.08)" };

const items = [
  {
    icon: "✅",
    title: "Verified Sellers",
    text: "Buy from approved sellers with moderation and account review.",
    accent: "#16a34a",
    bg: "#f0fdf4",
    bdr: "#bbf7d0",
  },
  {
    icon: "🔒",
    title: "Secure Checkout",
    text: "Clean ordering flow with protected account access and order tracking.",
    accent: "#1d4ed8",
    bg: "#eff6ff",
    bdr: "#bfdbfe",
  },
  {
    icon: "🌍",
    title: "Growing Marketplace",
    text: "A single destination for products, stores and categories across Morocco.",
    accent: "#0f766e",
    bg: "#f0fdfa",
    bdr: "#99f6e4",
  },
];

export default function TrustSection() {
  return (
    <section style={s.section}>
      <SectionHead title="Why RAHBA?" sub="Built to connect buyers and trusted sellers in one marketplace" />

      <div style={s.grid}>
        {items.map((item) => (
          <article key={item.title} style={s.card}>
            <div style={{ ...s.iconWrap, background: item.bg, border: `1px solid ${item.bdr}` }}>
              <span style={s.icon}>{item.icon}</span>
            </div>
            <div>
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
  },
  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
  },
  icon: { fontSize: "22px", lineHeight: 1 },
  title: { margin: "0 0 6px", fontSize: "16px", fontWeight: 800 },
  text: { margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.6 },
};
