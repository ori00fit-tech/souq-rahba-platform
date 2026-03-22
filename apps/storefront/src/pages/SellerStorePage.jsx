import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US")} MAD`;
}

export default function SellerStorePage() {
  const { slug } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSellerStore() {
      try {
        setLoading(true);
        setMessage("");

        // بدل هاد endpoint بالمسار العمومي الحقيقي ديالك إذا كان مختلف
        const sellerRes = await apiGet(`/marketplace/public/${encodeURIComponent(slug)}`);

        if (!sellerRes?.ok || !sellerRes?.data?.id) {
          setMessage(sellerRes?.message || "تعذر تحميل صفحة البائع");
          return;
        }

        const sellerData = sellerRes.data;
        setSeller(sellerData);

        const productsRes = await apiGet(
          `/catalog/products?seller_id=${encodeURIComponent(sellerData.id)}`
        );

        if (!productsRes?.ok) {
          setMessage(productsRes?.message || "تعذر تحميل منتجات البائع");
          return;
        }

        const payload = productsRes.data;

        if (Array.isArray(payload)) {
          setProducts(payload);
        } else {
          setProducts(Array.isArray(payload?.items) ? payload.items : []);
        }
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "حدث خطأ أثناء تحميل صفحة البائع");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadSellerStore();
    }
  }, [slug]);

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      featured: products.filter((p) => Number(p.featured) === 1).length
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
              <div className="ui-chip">
                {Number(seller.verified) === 1 ? "بائع موثق" : "متجر على رحبة"}
              </div>
              <h1 className="page-title" style={{ margin: 0 }}>
                {seller.display_name || "متجر بدون اسم"}
              </h1>
              <p className="page-subtitle" style={{ margin: 0 }}>
                {seller.city || "المغرب"}
              </p>
            </div>
          </div>

          <p style={s.brandDescription}>
            {seller.description ||
              "اكتشف منتجات هذا البائع داخل منصة رحبة. متجر متخصص يقدم منتجات مختارة بعناية وجودة موثوقة."}
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
              <strong style={s.statValue}>
                {Number(seller.verified) === 1 ? "موثق" : "عادي"}
              </strong>
              <span style={s.statLabel}>الحالة</span>
            </div>
          </div>
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
                <Link to={`/products/${product.slug || product.id}`}>
                  <img
                    src={product.image_url || "https://placehold.co/600x600?text=RAHBA"}
                    alt={product.title_ar || product.name || "product"}
                    className="product-card__image"
                  />
                </Link>

                <div className="product-card__body">
                  <div className="product-card__meta">
                    <span>{product.category_name || product.category || "منتج"}</span>
                  </div>

                  <h3 className="product-card__title">
                    {product.title_ar || product.name || "بدون اسم"}
                  </h3>

                  <div className="product-card__price">
                    {formatMoney(product.price_mad || product.price)}
                  </div>

                  <div className="product-card__actions">
                    <Link
                      to={`/products/${product.slug || product.id}`}
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px"
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
