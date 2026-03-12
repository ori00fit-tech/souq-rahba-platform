import { Link } from "react-router-dom";
import { SectionHead } from "./CategoryGrid";

const T = { navy: "#16356b", blue: "#1d4ed8", gold: "#b08d3c", border: "#ddd5c2", shadow: "rgba(22,53,107,0.08)" };

const sellers = [
  {
    name: "Atlas Store",
    city: "Casablanca",
    rating: "4.8",
    products: 124,
    text: "Trending electronics and accessories from a trusted marketplace seller.",
    color: "#1d4ed8",
  },
  {
    name: "Casa Market",
    city: "Rabat",
    rating: "4.6",
    products: 87,
    text: "Curated home products and decoration picks for modern spaces.",
    color: "#0f766e",
  },
  {
    name: "Rahba Tools",
    city: "Tangier",
    rating: "4.7",
    products: 63,
    text: "Reliable tools, workshop essentials and practical equipment.",
    color: "#b45309",
  },
];

export default function SellerSpotlightSection() {
  return (
    <section style={s.section}>
      <div style={s.headRow}>
        <SectionHead title="Featured Sellers" sub="Explore trusted stores growing on RAHBA" />
        <Link to="/sellers" style={s.seeAll}>See all →</Link>
      </div>

      <div style={s.grid}>
        {sellers.map((seller) => (
          <article key={seller.name} style={s.card}>
            {/* avatar + info */}
            <div style={s.top}>
              <div style={{ ...s.avatar, background: seller.color }}>
                {seller.name.charAt(0)}
              </div>
              <div>
                <div style={s.cardTitle}>{seller.name}</div>
                <div style={s.meta}>
                  <span>📍 {seller.city}</span>
                  <span style={s.dot}>·</span>
                  <span style={s.rating}>★ {seller.rating}</span>
                </div>
              </div>
            </div>

            <p style={s.text}>{seller.text}</p>

            {/* footer */}
            <div style={s.footer}>
              <span style={s.count}>{seller.products} products</span>
              <Link to="/sellers" style={s.link}>Visit store →</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: { display: "grid", gap: "18px" },
  headRow: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px",
  },
  seeAll: {
    textDecoration: "none", fontSize: "13px", fontWeight: 800,
    color: T.navy, whiteSpace: "nowrap", alignSelf: "center",
    padding: "8px 14px", borderRadius: "10px",
    border: "1.5px solid #ddd5c2", background: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "14px",
  },
  card: {
    background: "#fff", border: `1.5px solid ${T.border}`,
    borderRadius: "18px", padding: "18px",
    display: "grid", gap: "12px",
    boxShadow: `0 4px 16px ${T.shadow}`,
  },
  top: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "46px", height: "46px", borderRadius: "14px",
    color: "#fff", display: "grid", placeItems: "center",
    fontWeight: 900, fontSize: "18px", flexShrink: 0,
  },
  cardTitle: { fontSize: "16px", fontWeight: 800, color: T.navy },
  meta: { display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" },
  dot: { color: "#cbd5e1" },
  rating: { fontSize: "13px", fontWeight: 700, color: T.gold },
  text: { margin: 0, color: "#475569", fontSize: "13px", lineHeight: 1.6 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  count: { fontSize: "12px", color: "#94a3b8", fontWeight: 600 },
  link: {
    textDecoration: "none", fontSize: "13px", fontWeight: 800,
    color: T.navy, padding: "7px 12px", borderRadius: "10px",
    background: "#f0f4ff", border: "1px solid #c7d7f8",
  },
};
