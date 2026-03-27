import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const T = {
  navy: "#16356b",
  gold: "#b08d3c",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)"
};

function normalizeProduct(p) {
  return {
    id: p.id,
    slug: p.slug || "",
    name: p.name || p.title || "",
    title_ar: p.name || p.title || "",
    price: Number(p.price_mad ?? p.price ?? 0),
    price_mad: Number(p.price_mad ?? p.price ?? 0),
    seller_id: p.seller_id || null,
    seller: p.seller || "RAHBA",
    city: p.city || "",
    rating: Number(p.rating || 0),
    reviews: Number(p.reviews || 0),
    stock: Number(p.stock || 0),
    badge: p.badge || "",
    description: p.description || "",
    image_url: p.image_url || p.image || "",
    qty: Number(p.qty || p.quantity || 1),
    quantity: Number(p.quantity || p.qty || 1)
  };
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US")} MAD`;
}

export default function ProductCard({ product }) {
  const { addToCart } = useApp?.() ?? {};
  const normalized = normalizeProduct(product);

  return (
    <article style={s.card}>
      <div style={s.imgWrap}>
        {normalized.image_url ? (
          <img src={normalized.image_url} alt={normalized.name} style={s.img} loading="lazy" />
        ) : (
          <div style={s.noImg}>RAHBA</div>
        )}

        <div style={s.topBadges}>
          {normalized.badge ? <div style={s.featuredBadge}>{normalized.badge}</div> : <div />}
          <div style={s.ratingBadge}>★ {normalized.rating || 0}</div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.seller}>{normalized.seller}</div>
        <h3 style={s.title}>{normalized.name}</h3>

        <p style={s.description}>
          {normalized.description || "منتج متوفر داخل سوق رحبة بجودة موثوقة وتصفح واضح."}
        </p>

        <div style={s.metaRow}>
          <span style={s.stockBadge}>
            {normalized.stock > 0 ? `متوفر (${normalized.stock})` : "غير متوفر"}
          </span>
          <span style={s.reviewMeta}>
            {normalized.reviews > 0 ? `${normalized.reviews} تقييم` : "بدون تقييمات"}
          </span>
        </div>

        <div style={s.price}>{formatMoney(normalized.price)}</div>
      </div>

      <div style={s.actions}>
        {addToCart ? (
          <button
            onClick={() => addToCart(normalized)}
            style={s.cartBtn}
            aria-label="إضافة إلى السلة"
            disabled={normalized.stock <= 0}
          >
            أضف للسلة
          </button>
        ) : null}

        <Link
          to={normalized.slug ? `/products/${normalized.slug}` : "/products"}
          style={s.viewBtn}
        >
          عرض المنتج
        </Link>
      </div>
    </article>
  );
}

const s = {
  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "22px",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    boxShadow: `0 6px 18px ${T.shadow}`
  },

  imgWrap: {
    position: "relative",
    height: "190px",
    background: "#f8f6f0"
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  noImg: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    fontSize: "18px",
    fontWeight: 900,
    color: "#c1b7a3"
  },

  topBadges: {
    position: "absolute",
    top: "12px",
    right: "12px",
    left: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px"
  },

  featuredBadge: {
    background: "rgba(11, 77, 186, 0.92)",
    color: "#fff",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 900
  },

  ratingBadge: {
    background: "rgba(255,255,255,0.96)",
    border: `1px solid ${T.border}`,
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 800,
    color: T.gold
  },

  body: {
    padding: "16px 16px 10px",
    display: "grid",
    gap: "8px"
  },

  seller: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700
  },

  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
    color: T.navy,
    lineHeight: 1.45
  },

  description: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.8,
    minHeight: "46px"
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },

  stockBadge: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#166534",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "999px",
    padding: "6px 10px"
  },

  reviewMeta: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b"
  },

  price: {
    fontSize: "20px",
    fontWeight: 900,
    color: "#111827"
  },

  actions: {
    padding: "0 16px 16px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  cartBtn: {
    height: "42px",
    borderRadius: "14px",
    border: `1.5px solid ${T.border}`,
    background: "#f8f6f0",
    color: T.navy,
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer"
  },

  viewBtn: {
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: T.navy,
    color: "#fff",
    fontSize: "13px",
    fontWeight: 900,
    height: "42px"
  }
};
