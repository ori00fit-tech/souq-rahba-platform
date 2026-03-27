import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { formatMoney } from "../lib/utils";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

function getApiErrorMessage(result, fallback = "حدث خطأ أثناء التحميل") {
  return result?.error?.message || result?.message || fallback;
}

function normalizeSeller(seller) {
  return {
    id: seller?.id || "",
    slug: seller?.slug || "",
    display_name: seller?.display_name || "متجر بدون اسم",
    city: seller?.city || "المغرب",
    phone: seller?.phone || "",
    category: seller?.category || "",
    description:
      seller?.description ||
      "اكتشف منتجات هذا البائع داخل منصة رحبة. متجر متخصص يقدم منتجات مختارة بعناية وجودة موثوقة.",
    verified: Number(seller?.verified || 0),
    kyc_status: seller?.kyc_status || "pending",
    rating: Number(seller?.rating || 0),
    created_at: seller?.created_at || null,
    logo_url: resolveImageUrl(seller?.logo_url || "")
  };
}

function normalizeProduct(product) {
  return {
    id: product?.id || "",
    slug: product?.slug || "",
    title_ar: product?.title_ar || product?.name || "بدون اسم",
    description_ar: product?.description_ar || "",
    category_slug: product?.category_slug || product?.category || "",
    price_mad: Number(product?.price_mad || product?.price || 0),
    stock: Number(product?.stock || 0),
    featured: Number(product?.featured || 0),
    image_url: resolveImageUrl(product?.image_url || ""),
    status: product?.status || ""
  };
}

export default function SellerStorePage() {
  const { slug } = useParams();
  const requestIdRef = useRef(0);

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadSellerStore() {
    if (!slug) {
      setSeller(null);
      setProducts([]);
      setMessage("رابط البائع غير صالح");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setMessage("");

      const sellerRes = await apiGet(`/marketplace/public/${encodeURIComponent(slug)}`);

      if (requestId !== requestIdRef.current) return;

      if (!sellerRes?.ok || !sellerRes?.data?.id) {
        setSeller(null);
        setProducts([]);
        setMessage(getApiErrorMessage(sellerRes, "تعذر تحميل صفحة البائع"));
        return;
      }

      const sellerData = normalizeSeller(sellerRes.data);
      setSeller(sellerData);

      const productsRes = await apiGet(
        `/catalog/products?seller_id=${encodeURIComponent(sellerData.id)}`
      );

      if (requestId !== requestIdRef.current) return;

      if (!productsRes?.ok) {
        setProducts([]);
        setMessage(getApiErrorMessage(productsRes, "تعذر تحميل منتجات البائع"));
        return;
      }

      const payload = productsRes.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setProducts(items.map(normalizeProduct));
    } catch (err) {
      console.error(err);
      if (requestId !== requestIdRef.current) return;
      setSeller(null);
      setProducts([]);
      setMessage("حدث خطأ أثناء تحميل صفحة البائع");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadSellerStore();
  }, [slug]);

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      featured: products.filter((p) => Number(p.featured) === 1).length,
      available: products.filter((p) => Number(p.stock) > 0).length
    };
  }, [products]);

  if (loading) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA STORE</div>
            <h1 className="page-title">جاري تحميل صفحة البائع...</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!seller) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA STORE</div>
            <h1 className="page-title">تعذر العثور على البائع</h1>
            <p className="page-subtitle">{message || "هذه الصفحة غير متوفرة حالياً."}</p>
          </div>

          <Link to="/sellers" className="btn btn-primary full-width">
            الرجوع إلى الباعة
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div style={s.brandRow}>
            <div style={s.brandAvatar}>
              {seller.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={seller.display_name}
                  style={s.brandAvatarImg}
                />
              ) : (
                <span style={s.brandInitial}>
                  {(seller.display_name || "R").slice(0, 1)}
                </span>
              )}
            </div>

            <div style={s.brandMeta}>
              <div style={s.brandChips}>
                <div className="ui-chip">
                  {Number(seller.verified) === 1 ? "بائع موثق" : "متجر على رحبة"}
                </div>
                {seller.category ? (
                  <div className="ui-chip">{seller.category}</div>
                ) : null}
              </div>

              <h1 className="page-title" style={{ margin: 0 }}>
                {seller.display_name || "متجر بدون اسم"}
              </h1>

              <p className="page-subtitle" style={{ margin: 0 }}>
                {seller.city || "المغرب"}
                {seller.rating > 0 ? ` · ★ ${seller.rating.toFixed(1)}` : ""}
              </p>
            </div>
          </div>

          <p style={s.brandDescription}>
            {seller.description}
          </p>

          <div style={s.statsGrid}>
            <div className="ui-card-soft" style={s.statCard}>
              <strong style={s.statValue}>{stats.totalProducts}</strong>
              <span style={s.statLabel}>منتج</span>
            </div>

            <div className="ui-card-soft" style={s.statCard}>
              <strong style={s.statValue}>{stats.featured}</strong>
              <span style={s.statLabel}>منتجات مميزة</span>
            </div>

            <div className="ui-card-soft" style={s.statCard}>
              <strong style={s.statValue}>{stats.available}</strong>
              <span style={s.statLabel}>متوفر الآن</span>
            </div>
          </div>
        </div>

        <div style={s.topActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadSellerStore}
            disabled={loading}
          >
            {loading ? "جاري التحديث..." : "تحديث الصفحة"}
          </button>
        </div>

        {message ? <div className="message-box">{message}</div> : null}

        {!products.length ? (
          <div className="ui-card" style={s.emptyCard}>
            <div style={s.emptyIcon}>📦</div>
            <h3 style={s.emptyTitle}>لا توجد منتجات حالياً</h3>
            <p style={s.emptyText}>هذا المتجر لم يضف منتجات منشورة بعد.</p>
          </div>
        ) : (
          <div style={s.productsGrid}>
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <Link to={product.slug ? `/products/${product.slug}` : "/products"}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title_ar || "product"}
                      className="product-card__image"
                    />
                  ) : (
                    <div className="product-card__image" style={s.noImage}>
                      لا توجد صورة
                    </div>
                  )}
                </Link>

                <div className="product-card__body">
                  <div className="product-card__meta">
                    <span>{product.category_slug || "منتج"}</span>
                    <span>{product.stock > 0 ? "متوفر" : "غير متوفر"}</span>
                  </div>

                  <h3 className="product-card__title">
                    {product.title_ar || "بدون اسم"}
                  </h3>

                  <p className="product-card__desc">
                    {product.description_ar || "منتج من متجر هذا البائع داخل رحبة."}
                  </p>

                  <div className="product-card__price">
                    {formatMoney(product.price_mad || 0, "MAD", "fr-MA")}
                  </div>

                  <div className="product-card__actions">
                    <Link
                      to={product.slug ? `/products/${product.slug}` : "/products"}
                      className="btn btn-primary"
                      style={{ height: "42px", fontSize: "14px" }}
                    >
                      عرض المنتج
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "14px"
  },
  topActions: {
    display: "flex",
    justifyContent: "flex-start"
  },
  brandRow: {
    display: "grid",
    gridTemplateColumns: "72px 1fr",
    gap: "14px",
    alignItems: "center"
  },
  brandAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "22px",
    overflow: "hidden",
    background: "#eef6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #dbeafe"
  },
  brandAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  brandInitial: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#173b74"
  },
  brandMeta: {
    display: "grid",
    gap: "8px"
  },
  brandChips: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  brandDescription: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.9,
    fontSize: "15px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px"
  },
  statCard: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    textAlign: "center"
  },
  statValue: {
    color: "#173b74",
    fontSize: "20px",
    fontWeight: 900
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "12px"
  },
  noImage: {
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    background: "#f8fafc"
  },
  emptyCard: {
    display: "grid",
    gap: "12px",
    textAlign: "center"
  },
  emptyIcon: {
    fontSize: "40px"
  },
  emptyTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900
  },
  emptyText: {
    margin: 0,
    color: "#7a6f63",
    lineHeight: 1.8
  }
};
