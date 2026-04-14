import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { UI, semanticColors } from "./uiTokens";
import { normalizeMarketplaceProduct } from "../../utils/marketplaceProductMapper";

function formatPriceMAD(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0
  }).format(amount);
}

function getDiscountPercent(price, compareAtPrice) {
  const p = Number(price || 0);
  const c = Number(compareAtPrice || 0);
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
}

function getStockInfo(stockStatus, stock) {
  const qty = Number(stock || 0);
  if (stockStatus === "out_of_stock" || qty <= 0) {
    return { label: "غير متوفر", color: semanticColors.outOfStock, bg: UI.colors.errorBg };
  }
  if (stockStatus === "low_stock" || qty <= 3) {
    return { label: "كمية محدودة", color: semanticColors.lowStock, bg: UI.colors.warningBg };
  }
  return { label: "متوفر", color: semanticColors.inStock, bg: UI.colors.successBg };
}

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useApp?.() ?? {};
  const normalized = normalizeMarketplaceProduct(product);

  const discount = getDiscountPercent(normalized.price, normalized.compare_at_price);
  const stockInfo = getStockInfo(normalized.stock_status, normalized.stock);
  const productHref = normalized.slug ? `/products/${normalized.slug}` : "/products";
  const isOutOfStock = normalized.stock <= 0;

  return (
    <article style={s.card}>
      {/* Image Section */}
      <Link to={productHref} style={s.imageLink} aria-label={normalized.name || "عرض المنتج"}>
        <div style={s.imgWrap}>
          {normalized.image_url ? (
            <img
              src={normalized.image_url}
              alt={normalized.name}
              style={s.img}
              loading="lazy"
            />
          ) : (
            <div style={s.noImg}>
              <PackageIcon />
            </div>
          )}

          {/* Badges */}
          <div style={s.badges}>
            {discount > 0 && (
              <span style={s.discountBadge}>-{discount}%</span>
            )}
            <span style={{ ...s.stockBadge, background: stockInfo.bg, color: stockInfo.color }}>
              {stockInfo.label}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div style={s.body}>
        {/* Seller Info */}
        <div style={s.sellerRow}>
          <div style={s.sellerInfo}>
            <span style={s.sellerName}>{normalized.seller || "بائع"}</span>
            {normalized.seller_verified && (
              <span style={s.verified}>
                <VerifiedIcon />
              </span>
            )}
          </div>
          {normalized.city && (
            <span style={s.city}>
              <LocationIcon /> {normalized.city}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={productHref} style={s.titleLink}>
          <h3 style={s.title}>{normalized.name}</h3>
        </Link>

        {/* Rating */}
        {!compact && (
          <div style={s.ratingRow}>
            <span style={s.rating}>
              <StarIcon /> {normalized.rating ? normalized.rating.toFixed(1) : "0.0"}
            </span>
            <span style={s.reviews}>
              {normalized.reviews > 0 ? `${normalized.reviews} تقييم` : "بدون تقييمات"}
            </span>
          </div>
        )}

        {/* Price */}
        <div style={s.priceRow}>
          <span style={s.price}>{formatPriceMAD(normalized.price)}</span>
          {normalized.compare_at_price > normalized.price && (
            <span style={s.oldPrice}>{formatPriceMAD(normalized.compare_at_price)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        {addToCart && (
          <button
            onClick={() => addToCart(normalized)}
            style={{ ...s.addBtn, ...(isOutOfStock ? s.addBtnDisabled : {}) }}
            disabled={isOutOfStock}
          >
            <CartIcon />
            {isOutOfStock ? "غير متوفر" : "أضف للسلة"}
          </button>
        )}
        <Link to={productHref} style={s.viewBtn}>
          عرض
        </Link>
      </div>
    </article>
  );
}

// Icons
function PackageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4 10l12-6 12 6v12l-12 6-12-6V10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 16v10M4 10l12 6 12-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" fill="currentColor" />
      <path d="M4 6l1.5 1.5L8 5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1C4 1 2.5 2.5 2.5 4.5c0 2.5 3.5 6 3.5 6s3.5-3.5 3.5-6C9.5 2.5 8 1 6 1z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="4.5" r="1" fill="currentColor" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.5 3.2 3.5.5-2.5 2.4.6 3.4L6 9l-3.1 1.5.6-3.4L1 4.7l3.5-.5L6 1z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 5h9l-1 5H6L5 5zM5 5L4 2H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="13" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

const s = {
  card: {
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.lg,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s ease, transform 0.2s ease"
  },
  imageLink: {
    textDecoration: "none",
    display: "block"
  },
  imgWrap: {
    position: "relative",
    aspectRatio: "1",
    background: UI.colors.bgElevated,
    overflow: "hidden"
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  noImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: UI.colors.textMuted
  },
  badges: {
    position: "absolute",
    top: "8px",
    right: "8px",
    left: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "6px"
  },
  discountBadge: {
    padding: "4px 8px",
    background: UI.colors.error,
    color: "#fff",
    borderRadius: UI.radius.sm,
    fontSize: "11px",
    fontWeight: 600
  },
  stockBadge: {
    padding: "4px 8px",
    borderRadius: UI.radius.sm,
    fontSize: "11px",
    fontWeight: 600
  },
  body: {
    flex: 1,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sellerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  },
  sellerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  sellerName: {
    fontSize: "12px",
    fontWeight: 600,
    color: UI.colors.textSecondary
  },
  verified: {
    color: UI.colors.teal
  },
  city: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: UI.colors.textMuted
  },
  titleLink: {
    textDecoration: "none"
  },
  title: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: UI.colors.text,
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: 600,
    color: UI.colors.accent
  },
  reviews: {
    fontSize: "12px",
    color: UI.colors.textMuted
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginTop: "auto"
  },
  price: {
    fontSize: "18px",
    fontWeight: 700,
    color: UI.colors.accent
  },
  oldPrice: {
    fontSize: "13px",
    color: UI.colors.textMuted,
    textDecoration: "line-through"
  },
  actions: {
    display: "flex",
    gap: "8px",
    padding: "0 12px 12px"
  },
  addBtn: {
    flex: 1,
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: UI.colors.bgElevated,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.sm,
    color: UI.colors.text,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  addBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  viewBtn: {
    height: "40px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    borderRadius: UI.radius.sm,
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.2s ease"
  }
};
