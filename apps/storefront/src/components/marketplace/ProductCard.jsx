import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { UI } from "./uiTokens";

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
      background: UI.colors.dangerBg,
      color: UI.colors.dangerText,
      border: `1px solid ${UI.colors.dangerBorder}`
    };
  }

  if (Number(stock || 0) <= 3) {
    return {
      background: UI.colors.warningBg,
      color: UI.colors.warningText,
      border: `1px solid ${UI.colors.warningBorder}`
    };
  }

  return {
    background: UI.colors.successBg,
    color: UI.colors.successText,
    border: `1px solid ${UI.colors.successBorder}`
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
    background: UI.colors.white,
    border: `1px solid ${UI.colors.line}`,
    borderRadius: UI.radius.xxl,
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    boxShadow: UI.shadow.soft
  },

  imageLink: {
    textDecoration: "none"
  },

  imgWrap: {
    position: "relative",
    height: "184px",
    background: UI.colors.softSurface
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
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.pill,
    padding: "4px 10px",
    fontSize: UI.type.caption,
    fontWeight: 800,
    color: UI.colors.gold
  },

  stockBadge: {
    borderRadius: UI.radius.pill,
    padding: "4px 10px",
    fontSize: UI.type.caption,
    fontWeight: 900
  },

  body: {
    padding: UI.spacing.cardPadding,
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
    fontSize: UI.type.caption,
    color: UI.colors.navy,
    fontWeight: 800
  },

  city: {
    fontSize: UI.type.caption,
    color: UI.colors.muted,
    fontWeight: 700
  },

  titleLink: {
    textDecoration: "none"
  },

  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 900,
    color: UI.colors.ink,
    lineHeight: 1.5,
    minHeight: "44px"
  },

  desc: {
    margin: 0,
    fontSize: UI.type.caption,
    lineHeight: 1.7,
    color: UI.colors.muted,
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
    fontSize: UI.type.caption,
    fontWeight: 700,
    color: UI.colors.muted
  },

  reviewsMeta: {
    fontSize: UI.type.caption,
    color: UI.colors.muted,
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
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.softSurface,
    color: UI.colors.navy,
    fontSize: UI.type.bodySm,
    fontWeight: 900,
    cursor: "pointer"
  },

  viewBtn: {
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    borderRadius: UI.radius.md,
    background: UI.colors.navy,
    color: "#fff",
    fontSize: UI.type.bodySm,
    fontWeight: 900,
    height: "42px",
    padding: "0 14px"
  }
};
