import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import ProductCard from "../components/marketplace/ProductCard";
import { UI } from "../components/marketplace/uiTokens";

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
    name: product?.title_ar || product?.name || "بدون اسم",
    title: product?.title_ar || product?.name || "بدون اسم",
    description: product?.description_ar || "",
    category_slug: product?.category_slug || product?.category || "",
    price: Number(product?.price_mad || product?.price || 0),
    price_mad: Number(product?.price_mad || product?.price || 0),
    stock: Number(product?.stock || 0),
    rating: 0,
    reviews: 0,
    featured: Number(product?.featured || 0),
    seller: product?.seller_name || "RAHBA",
    seller_id: product?.seller_id || null,
    city: "",
    badge: product?.featured ? "مميز" : product?.status || "",
    image_url: resolveImageUrl(product?.image_url || "")
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
        <div style={styles.stack}>
          <SectionShell style={styles.heroShell}>
            <div className="ui-chip">RAHBA STORE</div>
            <SectionHead
              title="جاري تحميل صفحة البائع..."
              subtitle="نقوم بجلب معلومات المتجر والمنتجات المتاحة."
            />
          </SectionShell>
        </div>
      </section>
    );
  }

  if (!seller) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={styles.stack}>
          <SectionShell style={styles.heroShell}>
            <div className="ui-chip">RAHBA STORE</div>
            <SectionHead
              title="تعذر العثور على البائع"
              subtitle={message || "هذه الصفحة غير متوفرة حالياً."}
            />
          </SectionShell>

          <Link to="/sellers" className="btn btn-primary full-width">
            الرجوع إلى الباعة
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.stack}>
        <SectionShell style={styles.heroShell}>
          <div style={styles.brandRow}>
            <div style={styles.brandAvatar}>
              {seller.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={seller.display_name}
                  style={styles.brandAvatarImg}
                />
              ) : (
                <span style={styles.brandInitial}>
                  {(seller.display_name || "R").slice(0, 1)}
                </span>
              )}
            </div>

            <div style={styles.brandMeta}>
              <div style={styles.brandChips}>
                <div className="ui-chip">
                  {Number(seller.verified) === 1 ? "بائع موثق" : "متجر على رحبة"}
                </div>
                {seller.category ? <div className="ui-chip">{seller.category}</div> : null}
                <div className="ui-chip">
                  {seller.kyc_status === "approved" ? "توثيق مكتمل" : "قيد التحقق"}
                </div>
              </div>

              <h1 style={styles.storeTitle}>{seller.display_name || "متجر بدون اسم"}</h1>

              <div style={styles.storeMetaLine}>
                <span>📍 {seller.city || "المغرب"}</span>
                {seller.rating > 0 ? <span>• ⭐ {seller.rating.toFixed(1)}</span> : null}
                <span>• {stats.totalProducts} منتج</span>
              </div>
            </div>
          </div>

          <p style={styles.brandDescription}>{seller.description}</p>

          <div style={styles.statsGrid}>
            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.totalProducts}</strong>
              <span style={styles.statLabel}>منتج</span>
            </div>

            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.featured}</strong>
              <span style={styles.statLabel}>منتجات مميزة</span>
            </div>

            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.available}</strong>
              <span style={styles.statLabel}>متوفر الآن</span>
            </div>
          </div>

          <div style={styles.actionRow}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadSellerStore}
              disabled={loading}
            >
              {loading ? "جاري التحديث..." : "تحديث الصفحة"}
            </button>

            {seller.phone ? (
              <a
                href={`https://wa.me/${String(seller.phone).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-soft"
              >
                واتساب
              </a>
            ) : null}
          </div>
        </SectionShell>

        {message ? <div className="message-box">{message}</div> : null}

        {!products.length ? (
          <SectionShell>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <h3 style={styles.emptyTitle}>لا توجد منتجات حالياً</h3>
              <p style={styles.emptyText}>هذا المتجر لم يضف منتجات منشورة بعد.</p>
            </div>
          </SectionShell>
        ) : (
          <SectionShell>
            <SectionHead
              chip="STORE PRODUCTS"
              title="منتجات هذا المتجر"
              subtitle="تصفح المنتجات المنشورة داخل هذا المتجر واختر المنتج المناسب."
            />

            <div style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard key={product.id || product.slug || product.name} product={product} />
              ))}
            </div>
          </SectionShell>
        )}
      </div>
    </section>
  );
}

const styles = {
  stack: {
    display: "grid",
    gap: "26px"
  },

  heroShell: {
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.06) 0%, rgba(20,184,166,0.06) 100%)",
    border: "1px solid #dfe7f3"
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
    background: UI.colors.softBlue,
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
    color: UI.colors.navy
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

  storeTitle: {
    margin: 0,
    color: UI.colors.navy,
    fontSize: "30px",
    lineHeight: 1.2,
    fontWeight: 900
  },

  storeMetaLine: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
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
    color: UI.colors.navy,
    fontSize: "20px",
    fontWeight: 900
  },

  statLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: UI.spacing.cardGap
  },

  emptyState: {
    display: "grid",
    gap: "12px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "40px"
  },

  emptyTitle: {
    margin: 0,
    color: UI.colors.navy,
    fontWeight: 900
  },

  emptyText: {
    margin: 0,
    color: "#7a6f63",
    lineHeight: 1.8
  }
};
