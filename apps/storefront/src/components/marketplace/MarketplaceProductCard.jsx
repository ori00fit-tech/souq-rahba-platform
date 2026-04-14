import { Link } from "react-router-dom";
import { Heart, MapPin, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import {
  formatPriceMAD,
  getDiscountPercent,
  getStockMeta,
  normalizeMarketplaceProduct,
} from "../../utils/marketplaceProductMapper";

export default function MarketplaceProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className = "",
  productBasePath = "/products",
}) {
  const item = normalizeMarketplaceProduct(product);

  const {
    slug,
    name,
    price,
    compare_at_price,
    image_url,
    seller_name,
    seller_verified,
    city,
    rating_average,
    rating_count,
    stock_status,
    shipping_label,
    badges,
  } = item;

  const image = image_url || "https://placehold.co/600x600?text=Rahba";
  const discount = getDiscountPercent(price, compare_at_price);
  const stockMeta = getStockMeta(stock_status);
  const isOutOfStock = stock_status === "out_of_stock";
  const productHref = slug ? `${productBasePath}/${slug}` : "#";

  return (
    <article
      className={[
        "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        className,
      ].join(" ")}
    >
      <div className="relative">
        <Link to={productHref} className="block">
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              -{discount}%
            </span>
          )}

          {badges.includes("new") && (
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
              New
            </span>
          )}

          {badges.includes("featured") && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
              Featured
            </span>
          )}

          {badges.includes("sale") && discount === 0 && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              Sale
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => onToggleWishlist?.(item)}
          className={[
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full",
            "bg-white/90 shadow-sm backdrop-blur transition hover:bg-white",
            isWishlisted ? "text-red-600" : "text-slate-600",
          ].join(" ")}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stockMeta.className}`}
          >
            {stockMeta.label}
          </span>

          {shipping_label ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Truck className="h-3.5 w-3.5" />
              {shipping_label}
            </span>
          ) : null}
        </div>

        <div className="min-h-[48px]">
          <Link to={productHref} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-blue-700">
              {name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-semibold text-slate-700">
              {rating_average ? Number(rating_average).toFixed(1) : "—"}
            </span>
          </div>

          <span className="text-slate-400">•</span>

          <span className="text-slate-500">
            {rating_count
              ? `(${Number(rating_count).toLocaleString()})`
              : "No reviews yet"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium">{seller_name}</span>
            {seller_verified ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ) : null}
          </span>

          {city ? (
            <>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {city}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3 pt-1">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {formatPriceMAD(price)}
              </span>

              {compare_at_price && Number(compare_at_price) > Number(price) ? (
                <span className="text-sm text-slate-400 line-through">
                  {formatPriceMAD(compare_at_price)}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart?.(item)}
            className={[
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-blue-600 text-white hover:bg-blue-700",
            ].join(" ")}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? "Unavailable" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
