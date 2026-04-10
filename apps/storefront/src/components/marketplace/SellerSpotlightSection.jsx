import { Link } from "react-router-dom";
import SectionHead from "./SectionHead";

const T = {
  navy: "#16356b",
  ink: "#243041",
  muted: "#6b7280",
  line: "#e8dfd0",
  card: "#fffdfa",
  white: "#ffffff"
};

function normalizeSeller(seller) {
  return {
    id: seller?.id || "",
    slug: seller?.slug || "",
    name: seller?.display_name || seller?.name || "متجر",
    city: seller?.city || "المغرب",
    rating: Number(seller?.rating || 0),
    verified: Boolean(seller?.verified),
    kyc_status: seller?.kyc_status || "",
    products_count: Number(seller?.products_count || 0)
  };
}

export default function SellerSpotlightSection({ sellers = [] }) {
  const items = sellers.map(normalizeSeller);

  if (!items.length) return null;

  return (
    <section style={s.section} dir="rtl">
      <div style={s.headRow}>
        <SectionHead
          chip="SELLERS"
          title="باعة ومتاجر مميزة"
          subtitle="اكتشف متاجر نشيطة داخل رحبة وابدأ التسوق من بائعين واضحين"
        />
        <Link to="/sellers" style={s.seeAll}>عرض الكل ←</Link>
      </div>

      <div style={s.grid}>
        {items.map((seller) => (
          <div key={seller.id || seller.slug || seller.name} className="ui-card-soft" style={s.card}>
            <div style={s.cardTop}>
              <div style={s.avatar}>{seller.name.slice(0, 1)}</div>

              <div style={s.identity}>
                <div style={s.nameRow}>
                  <strong style={s.name}>{seller.name}</strong>
                  {seller.verified ? <span style={s.verified}>موثوق</span> : null}
                </div>

                <div style={s.meta}>
                  <span>📍 {seller.city}</span>
                  <span>•</span>
                  <span>⭐ {seller.rating || 0}</span>
                </div>
              </div>
            </div>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <strong style={s.statValue}>{seller.products_count || 0}</strong>
                <span style={s.statLabel}>منتج</span>
              </div>

              <div style={s.statBox}>
                <strong style={s.statValue}>
                  {seller.kyc_status === "approved" ? "نعم" : "—"}
                </strong>
                <span style={s.statLabel}>توثيق</span>
              </div>
            </div>

            <Link
              to={seller.slug ? `/seller/${seller.slug}` : "#"}
              style={{
                ...s.storeBtn,
                opacity: seller.slug ? 1 : 0.5,
                pointerEvents: seller.slug ? "auto" : "none"
              }}
            >
              عرض المتجر
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gap: "18px"
  },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px"
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
    background: T.white
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px"
  },

  card: {
    padding: "14px",
    display: "grid",
    gap: "14px",
    border: `1px solid ${T.line}`,
    background: T.card
  },

  cardTop: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "#eef6ff",
    color: T.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "18px",
    flexShrink: 0
  },

  identity: {
    display: "grid",
    gap: "6px"
  },

  nameRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  name: {
    color: T.ink,
    fontSize: "16px"
  },

  verified: {
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #a7f3d0",
    fontSize: "11px",
    fontWeight: 900
  },

  meta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    color: T.muted,
    fontSize: "12px",
    fontWeight: 700
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },

  statBox: {
    display: "grid",
    gap: "4px",
    padding: "10px",
    borderRadius: "12px",
    background: T.white,
    border: `1px solid ${T.line}`,
    textAlign: "center"
  },

  statValue: {
    color: T.navy,
    fontSize: "16px",
    fontWeight: 900
  },

  statLabel: {
    color: T.muted,
    fontSize: "12px",
    fontWeight: 700
  },

  storeBtn: {
    textDecoration: "none",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: "12px",
    background: T.white,
    border: `1px solid ${T.line}`,
    color: T.navy,
    fontWeight: 900
  }
};
