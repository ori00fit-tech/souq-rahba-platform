import { Link } from "react-router-dom";
import { SectionHead } from "./CategoryGrid";

const T = {
  navy: "#16356b",
  gold: "#b08d3c",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)",
};

export default function SellerSpotlightSection({ sellers = [] }) {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.headRow}>
        <SectionHead
          title="باعة مميزون"
          sub="متاجر موثوقة ومعتمدة داخل منصة رحبة"
        />
        <Link to="/sellers" style={s.seeAll}>عرض الكل ←</Link>
      </div>

      <div style={s.grid}>
        {sellers.map((seller) => (
          <article key={seller.id} style={s.card}>
            <div style={s.top}>
              <div style={s.avatar}>
                {seller.logo_url ? (
                  <img src={seller.logo_url} alt={seller.display_name} style={s.avatarImg} />
                ) : (
                  seller.display_name?.charAt(0) || "ر"
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={s.cardTitle}>{seller.display_name}</div>
                <div style={s.meta}>
                  <span>📍 {seller.city || "المغرب"}</span>
                  <span style={s.dot}>·</span>
                  <span style={s.rating}>★ {seller.rating || 0}</span>
                </div>
              </div>
            </div>

            <p style={s.text}>
              بائع موثوق داخل منصة رحبة مع حساب موثق ومنتجات جاهزة للتصفح.
            </p>

            <div style={s.footer}>
              <span style={s.count}>
                {seller.verified ? "موثّق" : "قيد المراجعة"}
              </span>
              <Link to="/sellers" style={s.link}>
                زيارة المتجر
              </Link>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  seeAll: {
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
    color: T.navy,
    whiteSpace: "nowrap",
    alignSelf: "center",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "14px",
  },

  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "12px",
    boxShadow: `0 4px 16px ${T.shadow}`,
  },

  top: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexDirection: "row-reverse",
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "#eef4ff",
    color: T.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "18px",
    flexShrink: 0,
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: T.navy,
  },

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "3px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },

  dot: { color: "#cbd5e1" },

  rating: {
    fontSize: "13px",
    fontWeight: 700,
    color: T.gold,
  },

  text: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.6,
    textAlign: "right",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  count: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 600,
  },

  link: {
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
    color: T.navy,
    padding: "7px 12px",
    borderRadius: "10px",
    background: "#f0f4ff",
    border: "1px solid #c7d7f8",
  },
};
