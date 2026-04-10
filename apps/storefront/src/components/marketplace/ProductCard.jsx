import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const T = {
  navy: "#16356b",
  ink: "#243041",
  muted: "#64748b",
  border: "#ddd5c2",
  line: "#e8dfd0",
  soft: "#f8f6f0",
  white: "#ffffff",
  gold: "#b08d3c",
  successBg: "#ecfdf5",
  successText: "#166534",
  successBorder: "#a7f3d0",
  dangerBg: "#fef2f2",
  dangerText: "#b91c1c",
  dangerBorder: "#fecaca",
  shadow: "rgba(22,53,107,0.08)"
};

function normalizeProduct(p) {
  return {
    id: p?.id,
    slug: p?.slug || "",
    name: p?.name || p?.title || "",
    title_ar: p?.name || p?.title || "",
    price: Number(p?.price_mad ?? p?.price ?? 0),
    price_mad: Number(p?.price_mad ?? p?.price ?? 0),
    seller_id: p?.seller_id || null,
    seller: p?.seller || "RAHBA",
    city: p?.city || "",
    rating: Number(p?.rating || 0),
    reviews: Number(p?.reviews || 0),
    stock: Number(p?.stock || 0),
    badge: p?.badge || "",
    description: p?.description || "",
    image_url: p?.image_url || p?.image || "",
    qty: Number(p?.qty || p?.quantity || 1),
    quantity: Number(p?.quantity || p?.qty || 1)
  };
}

function getStockLabel(stock) {
  if (Number(stock || 0) <= 0) return "غير متوفر";
  if (Number(stock || 0) <= 3) return "كمية محدودة";
  return "متوفر";
}

function getStockStyle(stock) {
  if (Number(stock || 0) <= 0) {
    return {
      background: T.dangerBg,
      color: T.dangerText,
      border: `1px solid ${T.dangerBorder}`
    };
  }

  return {
    background: T.successBg,
    color: T.successText,
    border: `1px solid ${T.successBorder}`
  };
}

export default function ProductCard({ product }) {
  const { addToCart } = useApp?.() ?? {};
  const normalized = normalizeProduct(product);

  return (
    <article style={s.card}>
      <Link
        to={normalized.slug ? `/products/${normalized.slug}` : "/products"}
        style={s.imageLink}
        aria-label={normalized.name || "عرض المنتج"}
      >
        <div style={s.imgWrap}>
          {normalized.image_url ? (
            <img
              src={normalized.image_url}
              alt={normalized.name}
              style={s.img}
              loading="lazy"
            />
          ) : (
            <div style={s.noImg}>📦</div>
          )}

          <div style={s.topBadges}>
            <div style={s.ratingBadge}>★ {normalized.rating || 0}</div>
            <div style={{ ...s.stockBadge, ...getStockStyle(normalized.stock) }}>
              {getStockLabel(normalized.stock)}
            </div>
          </div>
        </div>
      </Link>

      <div style={s.body}>
        <div style={s.metaTop}>
          <div style={s.seller}>{normalized.seller}</div>
          {normalized.city ? <div style={s.city}>📍 {normalized.city}</div> : null}
        </div>

        <Link
          to={normalized.slug ? `/products/${normalized.slug}` : "/products"}
          style={s.titleLink}
        >
          <h3 style={s.title}>{normalized.name}</h3>
        </Link>

        {normalized.description ? (
          <p style={s.desc}>{normalized.description}</p>
        ) : null}

        <div style={s.priceRow}>
          <div style={s.price}>
            {normalized.price}
            <span style={s.currency}> MAD</span>
          </div>

          {normalized.reviews > 0 ? (
            <div style={s.reviewsMeta}>{normalized.reviews} تقييم</div>
          ) : (
            <div style={s.reviewsMeta}>بدون تقييمات</div>
          )}
        </div>
      </div>

      <div style={s.actions}>
        {addToCart ? (
          <button
            onClick={() => addToCart(normalized)}
            style={s.cartBtn}
            aria-label="أضف إلى السلة"
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
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    boxShadow: `0 8px 24px ${T.shadow}`
  },

  imageLink: {
    textDecoration: "none"
  },

  imgWrap: {
    position: "relative",
    height: "184px",
    background: T.soft
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },

  noImg: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    fontSize: "40px",
    color: "#d1c9b8"
  },

  topBadges: {
    position: "absolute",
    top: "10px",
    right: "10px",
    left: "10px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "flex-start"
  },

  ratingBadge: {
    background: "rgba(255,255,255,0.94)",
    border: `1px solid ${T.border}`,
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 800,
    color: T.gold
  },

  stockBadge: {
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 900
  },

  body: {
    padding: "14px",
    display: "grid",
    gap: "8px"
  },

  metaTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  seller: {
    fontSize: "12px",
    color: T.navy,
    fontWeight: 800
  },

  city: {
    fontSize: "12px",
    color: T.muted,
    fontWeight: 700
  },

  titleLink: {
    textDecoration: "none"
  },

  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 900,
    color: T.ink,
    lineHeight: 1.5,
    minHeight: "44px"
  },

  desc: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.7,
    color: T.muted,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-end",
    flexWrap: "wrap"
  },

  price: {
    fontSize: "21px",
    fontWeight: 900,
    color: "#111827",
    lineHeight: 1.2
  },

  currency: {
    fontSize: "12px",
    fontWeight: 700,
    color: T.muted
  },

  reviewsMeta: {
    fontSize: "12px",
    color: T.muted,
    fontWeight: 700
  },

  actions: {
    padding: "0 14px 14px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },

  cartBtn: {
    height: "42px",
    borderRadius: "12px",
    border: `1px solid ${T.border}`,
    background: "#f5f1e8",
    color: T.navy,
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer"
  },

  viewBtn: {
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: T.navy,
    color: "#fff",
    fontSize: "13px",
    fontWeight: 900,
    height: "42px",
    padding: "0 14px"
  }
};
