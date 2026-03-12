import { Link } from "react-router-dom";

const T = {
  navy: "#16356b", blue: "#1d4ed8", teal: "#0f766e",
  sand: "#f5f1e8", border: "#ddd5c2", shadow: "rgba(22,53,107,0.08)",
};

const categories = [
  { name: "Electronics",  icon: "📱", text: "Phones, gadgets & digital devices",  slug: "electronics" },
  { name: "Fashion",      icon: "👕", text: "Clothing, shoes & accessories",       slug: "fashion" },
  { name: "Home",         icon: "🏠", text: "Furniture, décor & essentials",       slug: "home" },
  { name: "Beauty",       icon: "💄", text: "Skincare, cosmetics & wellness",      slug: "beauty" },
  { name: "Sports",       icon: "🏃", text: "Fitness, outdoor & training gear",    slug: "sports" },
  { name: "Tools",        icon: "🛠️", text: "Workshop, DIY & pro equipment",      slug: "tools" },
  { name: "Automotive",   icon: "🚗", text: "Car accessories & maintenance",       slug: "automotive" },
  { name: "Garden",       icon: "🌿", text: "Outdoor, plants & agriculture",       slug: "garden" },
];

export default function CategoryGrid() {
  return (
    <section style={s.section}>
      <SectionHead title="Browse Categories" sub="Start exploring through broad product categories" />

      <div style={s.grid}>
        {categories.map((cat) => (
          <Link key={cat.name} to={`/products?category=${cat.slug}`} style={s.card}>
            <div style={s.iconWrap}>
              <span style={s.icon}>{cat.icon}</span>
            </div>
            <div>
              <div style={s.cardTitle}>{cat.name}</div>
              <div style={s.cardText}>{cat.text}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── shared head ─────────────────────────────────────────── */
export function SectionHead({ title, sub }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: T.navy }}>{title}</h2>
      {sub && <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

const s = {
  section: { display: "grid", gap: "18px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
    gap: "12px",
  },
  card: {
    textDecoration: "none",
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: `0 4px 16px ${T.shadow}`,
    transition: "transform 0.15s, box-shadow 0.15s",
    cursor: "pointer",
  },
  iconWrap: {
    width: "48px", height: "48px",
    borderRadius: "14px",
    background: T.sand,
    border: `1px solid ${T.border}`,
    display: "grid", placeItems: "center",
  },
  icon: { fontSize: "24px", lineHeight: 1 },
  cardTitle: { fontSize: "15px", fontWeight: 800, color: T.navy, marginBottom: "4px" },
  cardText:  { fontSize: "12px", color: "#64748b", lineHeight: 1.5 },
};
