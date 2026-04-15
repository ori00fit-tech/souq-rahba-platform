import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { UI } from "./uiTokens";
import { normalizeMarketplaceProduct } from "../../utils/marketplaceProductMapper";

function formatPriceMAD(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscountPercent(price, compareAtPrice) {
  const p = Number(price || 0);
  const c = Number(compareAtPrice || 0);
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

function getStockLabel(stockStatus, stock) {
  if (stockStatus === "out_of_stock" || Number(stock || 0) <= 0) return "غير متوفر";
  if (stockStatus === "low_stock" || Number(stock || 0) <= 3) return "كمية محدودة";
  return "متوفر";
}

function getStockStyle(stockStatus, stock) {
  if (stockStatus === "out_of_stock" || Number(stock || 0) <= 0) {
    return {
      background: UI.colors.dangerBg,
      color: UI.colors.dangerText,
      border: `1px solid ${UI.colors.dangerBorder}`,
    };
  }

  if (stockStatus === "low_stock" || Number(stock || 0) <= 3) {
    return {
      background: UI.colors.warningBg,
      color: UI.colors.warningText,
      border: `1px solid ${UI.colors.warningBorder}`,
    };
  }

  return {
    background: UI.colors.successBg,
    color: UI.colors.successText,
    border: `1px solid ${UI.colors.successBorder}`,
  };
}

export default function ProductCard({ product }) {
  const { addToCart } = useApp?.() ?? {};
  const normalized = normalizeMarketplaceProduct(product);

  const discount = getDiscountPercent(
    normalized.price,
    normalized.compare_at_price
  );

  const stockLabel = getStockLabel(normalized.stock_status, normalized.stock);
  const stockStyle = getStockStyle(normalized.stock_status, normalized.stock);
  const productHref = normalized.slug
    ? `/products/${normalized.slug}`
    : "/products";

  return (
    <article style={s.card}>
      <Link
        to={productHref}
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

          <div style={s.overlayGradient} />

          <div style={s.topBadges}>
            <div style={s.leftBadges}>
              {discount > 0 ? (
                <div style={s.discountBadge}>-{discount}%</div>
              ) : normalized.badge ? (
                <div style={s.featureBadge}>{normalized.badge}</div>
              ) : null}
            </div>

            <div style={{ ...s.stockBadge, ...stockStyle }}>
              {stockLabel}
            </div>
          </div>
        </div>
      </Link>

      <div style={s.body}>
        <div style={s.metaTop}>
          <div style={s.sellerRow}>
            <span style={s.seller}>{normalized.seller}</span>
            {normalized.seller_verified ? (
              <span style={s.verifiedDot}>✔</span>
            ) : null}
          </div>

          {normalized.city ? <div style={s.city}>📍 {normalized.city}</div> : null}
        </div>

        <Link to={productHref} style={s.titleLink}>
          <h3 style={s.title}>{normalized.name}</h3>
        </Link>

        <div style={s.ratingRow}>
          <div style={s.ratingBadge}>
            ★ {normalized.rating ? normalized.rating.toFixed(1) : "0.0"}
          </div>

          {normalized.reviews > 0 ? (
            <div style={s.reviewsMeta}>{normalized.reviews} تقييم</div>
          ) : (
            <div style={s.reviewsMeta}>بدون تقييمات</div>
          )}

          {normalized.shipping_label ? (
            <div style={s.shippingMeta}>🚚 {normalized.shipping_label}</div>
          ) : null}
        </div>

        {normalized.description ? (
          <p style={s.desc}>{normalized.description}</p>
        ) : null}

        <div style={s.priceRow}>
          <div style={s.priceWrap}>
            <div style={s.price}>{formatPriceMAD(normalized.price)}</div>

            {normalized.compare_at_price &&
            Number(normalized.compare_at_price) > Number(normalized.price) ? (
              <div style={s.oldPrice}>
                {formatPriceMAD(normalized.compare_at_price)}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={s.actions}>
        {addToCart ? (
          <button
            onClick={() => addToCart(normalized)}
            style={{
              ...s.cartBtn,
              ...(normalized.stock <= 0 ? s.cartBtnDisabled : {}),
            }}
            aria-label="أضف إلى السلة"
            disabled={normalized.stock <= 0}
          >
            {normalized.stock <= 0 ? "غير متوفر" : "أضف للسلة"}
          </button>
        ) : null}

        <Link to={productHref} style={s.viewBtn}>
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
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.07)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },

  imageLink: {
    textDecoration: "none",
  },

  imgWrap: {
    position: "relative",
    height: "230px",
    background: "#f8fafc",
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  noImg: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    fontSize: "42px",
    color: "#d1c9b8",
    background: "linear-gradient(135deg, #f8fafc 0%, #f3efe7 100%)",
  },

  overlayGradient: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(15,23,42,0.08), transparent 45%)",
    pointerEvents: "none",
  },

  topBadges: {
    position: "absolute",
    top: "12px",
    right: "12px",
    left: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "flex-start",
  },

  leftBadges: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  discountBadge: {
    background: "#dc2626",
    color: "#fff",
    borderRadius: UI.radius.pill,
    padding: "5px 10px",
    fontSize: UI.type.caption,
    fontWeight: 900,
    boxShadow: "0 8px 20px rgba(220, 38, 38, 0.18)",
  },

  featureBadge: {
    background: "rgba(255,255,255,0.94)",
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.pill,
    padding: "5px 10px",
    fontSize: UI.type.caption,
    fontWeight: 900,
    color: UI.colors.navy,
  },

  stockBadge: {
    borderRadius: UI.radius.pill,
    padding: "5px 10px",
    fontSize: UI.type.caption,
    fontWeight: 900,
    backdropFilter: "blur(8px)",
  },

  body: {
    padding: UI.spacing.cardPadding,
    display: "grid",
    gap: "10px",
  },

  metaTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },

  sellerRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: 0,
  },

  seller: {
    color: UI.colors.navy,
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    lineHeight: 1.5,
  },

  verifiedDot: {
    color: UI.colors.tealDark,
    fontSize: "12px",
    fontWeight: 900,
    flexShrink: 0,
  },

  city: {
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700,
    lineHeight: 1.5,
  },

  titleLink: {
    textDecoration: "none",
  },

  title: {
    margin: 0,
    color: UI.colors.ink,
    fontSize: "18px",
    lineHeight: 1.5,
    fontWeight: 900,
  },

  ratingRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  ratingBadge: {
    minHeight: "28px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    display: "inline-flex",
    alignItems: "center",
    fontSize: UI.type.caption,
    fontWeight: 800,
  },

  reviewsMeta: {
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700,
  },

  shippingMeta: {
    color: UI.colors.navy,
    fontSize: UI.type.caption,
    fontWeight: 700,
  },

  desc: {
    margin: 0,
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    lineHeight: 1.85,
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "12px",
  },

  priceWrap: {
    display: "grid",
    gap: "4px",
  },

  price: {
    color: UI.colors.ink,
    fontSize: "22px",
    fontWeight: 900,
    lineHeight: 1.15,
  },

  oldPrice: {
    color: "#94a3b8",
    fontSize: UI.type.bodySm,
    fontWeight: 700,
    textDecoration: "line-through",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    padding: `0 ${UI.spacing.cardPadding} ${UI.spacing.cardPadding}`,
  },

  cartBtn: {
    minHeight: "46px",
    borderRadius: UI.radius.lg,
    border: "none",
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 100%)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(13,44,84,0.16)",
  },

  cartBtnDisabled: {
    background: "#e5e7eb",
    color: "#94a3b8",
    boxShadow: "none",
    cursor: "not-allowed",
  },

  viewBtn: {
    minHeight: "46px",
    borderRadius: UI.radius.lg,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    color: UI.colors.ink,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
};
