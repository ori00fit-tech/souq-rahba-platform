import { Link } from "react-router-dom";
import { SectionHead } from "./CategoryGrid";

const T = {
  navy: "#16356b",
  gold: "#b08d3c",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)",
  text: "#475569"
};

function getSellerHref(seller) {
  return seller?.slug ? `/sellers/${seller.slug}` : "/sellers";
}

export default function SellerSpotlightSection({ sellers = [] }) {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.headWrap}>
        <div style={s.headRow}>
          <SectionHead
            title="باعة مميزون"
            sub="متاجر مختارة داخل رحبة تجمع بين الوضوح، التوثيق، وسهولة التصفح"
          />
          <Link to="/sellers" style={s.seeAll}>عرض الكل ←</Link>
        </div>

        <div style={s.infoStrip}>
          <span style={s.infoChip}>متاجر موثوقة</span>
          <span style={s.infoChip}>عرض مباشر</span>
          <span style={s.infoChip}>منتجات جاهزة للتصفح</span>
        </div>
      </div>

      <div style={s.grid}>
        {sellers.map((seller, index) => (
          <article
            key={seller.id}
            style={{
              ...s.card,
              ...(index === 0 ? s.cardFeatured : {})
            }}
          >
            <div style={s.top}>
              <div style={s.avatar}>
                {seller.logo_url ? (
                  <img src={seller.logo_url} alt={seller.display_name} style={s.avatarImg} />
                ) : (
                  seller.display_name?.charAt(0) || "ر"
                )}
              </div>

              <div style={s.topMeta}>
                <div style={s.titleRow}>
                  <div style={s.cardTitle}>{seller.display_name}</div>
                  <span style={seller.verified ? s.verifiedBadge : s.pendingBadge}>
                    {seller.verified ? "موثّق" : "قيد المراجعة"}
                  </span>
                </div>

                <div style={s.meta}>
                  <span>📍 {seller.city || "المغرب"}</span>
                  <span style={s.dot}>·</span>
                  <span style={s.rating}>★ {Number(seller.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <p style={s.text}>
              {seller.description ||
                "متجر حاضر داخل رحبة مع تجربة واضحة للمنتجات وإمكانية الوصول السريع إلى صفحة البائع."}
            </p>

            <div style={s.footer}>
              <span style={s.count}>
                {seller.kyc_status === "approved" || seller.verified ? "جاهز للبيع" : "جارٍ الإعداد"}
              </span>

              <div style={s.actions}>
                <Link to={getSellerHref(seller)} style={s.primaryLink}>
                  زيارة المتجر
                </Link>
                <Link to={`/products?seller_id=${seller.id}`} style={s.secondaryLink}>
                  المنتجات
                </Link>
              </div>
            </div>
          </article>
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

  headWrap: {
    display: "grid",
    gap: "10px"
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
    borderRadius: "12px",
    border: "1.5px solid #ddd5c2",
    background: "#fff"
  },

  infoStrip: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  infoChip: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#475569",
    background: "#fff",
    border: "1px solid #e5dcc9",
    padding: "7px 11px",
    borderRadius: "999px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px"
  },

  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "22px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    boxShadow: `0 6px 18px ${T.shadow}`
  },

  cardFeatured: {
    background:
      "linear-gradient(180deg, rgba(255,249,235,0.9) 0%, rgba(255,255,255,1) 100%)"
  },

  top: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "12px",
    alignItems: "center"
  },

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "#eef4ff",
    color: T.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "20px",
    overflow: "hidden"
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  topMeta: {
    display: "grid",
    gap: "6px"
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },

  cardTitle: {
    fontSize: "17px",
    fontWeight: 900,
    color: T.navy
  },

  verifiedBadge: {
    fontSize: "11px",
    fontWeight: 900,
    color: "#166534",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "999px",
    padding: "6px 10px"
  },

  pendingBadge: {
    fontSize: "11px",
    fontWeight: 900,
    color: "#92400e",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "999px",
    padding: "6px 10px"
  },

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: "13px"
  },

  dot: {
    color: "#cbd5e1"
  },

  rating: {
    color: T.gold,
    fontWeight: 800
  },

  text: {
    margin: 0,
    color: T.text,
    fontSize: "14px",
    lineHeight: 1.8,
    minHeight: "50px"
  },

  footer: {
    display: "grid",
    gap: "12px"
  },

  count: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  primaryLink: {
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    height: "42px",
    borderRadius: "14px",
    background: T.navy,
    color: "#fff",
    fontSize: "13px",
    fontWeight: 900
  },

  secondaryLink: {
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    height: "42px",
    borderRadius: "14px",
    background: "#f8f6f0",
    border: `1.5px solid ${T.border}`,
    color: T.navy,
    fontSize: "13px",
    fontWeight: 900
  }
};
