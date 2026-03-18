import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function ProductCard({ product }) {
  const { addToCart, t, currency, language } = useApp();
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-US";

  const normalized = {
    id: product.id,
    slug: product.slug,
    name: product.title_ar || product.name || "",
    title_ar: product.title_ar || product.name || "",
    price: Number(product.price_mad ?? product.price ?? 0),
    price_mad: Number(product.price_mad ?? product.price ?? 0),
    seller_id: product.seller_id || null,
    seller: product.seller || product.seller_name || product.seller_id || "Souq Rahba",
    city: product.city || "",
    rating: Number(product.rating || product.rating_avg || 0),
    reviews: Number(product.reviews || product.reviews_count || 0),
    stock: Number(product.stock || 0),
    badge: product.badge || product.status || "",
    description: product.description_ar || product.description || "",
    image_url: product.image_url || "",
    qty: 1,
    quantity: 1
  };

  return (
    <article className="product-card">
      <div className="product-badge">{normalized.badge}</div>

      <div className="product-thumb" style={{ overflow: "hidden" }}>
        {normalized.image_url ? (
          <img
            src={normalized.image_url}
            alt={normalized.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          normalized.name.charAt(0)
        )}
      </div>

      <div className="product-content">
        <p className="meta">
          {normalized.seller}
          {normalized.city ? ` • ${normalized.city}` : ""}
        </p>

        <h3>{normalized.name}</h3>
        <p>{normalized.description}</p>

        <div className="price-row">
          <strong>{formatMoney(normalized.price, currency, locale)}</strong>
        </div>

        <div className="rating-row">
          {normalized.rating
            ? `⭐ ${normalized.rating} • ${normalized.reviews} reviews`
            : `Stock: ${normalized.stock}`}
        </div>

        <div className="card-actions">
          <button
            className="btn btn-primary"
            onClick={() => addToCart(normalized)}
            disabled={normalized.stock <= 0}
          >
            {normalized.stock <= 0 ? "غير متوفر" : t.addToCart}
          </button>

          <Link className="btn btn-secondary" to={`/products/${normalized.slug}`}>
            {t.buyNow}
          </Link>
        </div>
      </div>
    </article>
  );
}
