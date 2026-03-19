import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر: من الأقل إلى الأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى إلى الأقل" },
  { value: "featured", label: "المنتجات المميزة" },
  { value: "stock_desc", label: "الأكثر توفراً" }
];

const CATEGORY_OPTIONS = [
  { value: "", label: "كل الفئات" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "appliances", label: "أجهزة منزلية" },
  { value: "tools", label: "أدوات ومعدات" },
  { value: "agriculture", label: "فلاحة وسقي" },
  { value: "fishing", label: "صيد وبحر" },
  { value: "construction", label: "بناء وورش" },
  { value: "fashion", label: "أزياء" },
  { value: "food", label: "مواد غذائية" }
];

const PAGE_LIMIT = 12;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 1
  });

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

  useEffect(() => {
    setDraftQuery(q);
  }, [q]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setMessage("");

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", String(PAGE_LIMIT));

        const result = await apiGet(`/catalog/products?${params.toString()}`);
        const items = Array.isArray(result?.data?.items)
          ? result.data.items
          : Array.isArray(result?.data)
          ? result.data
          : [];

        const nextPagination = result?.data?.pagination || {
          page: 1,
          limit: PAGE_LIMIT,
          total: items.length,
          pages: 1
        };

        setProducts(items);
        setPagination(nextPagination);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setPagination({
          page: 1,
          limit: PAGE_LIMIT,
          total: 0,
          pages: 1
        });
        setMessage("تعذر تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [q, category, sort, page]);

  function updateFilters(next) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in next)) {
      params.set("page", "1");
    }

    setSearchParams(params);
  }

  function clearFilters() {
    setDraftQuery("");
    setMessage("");
    setSearchParams({});
  }

  function applySearch() {
    updateFilters({ q: draftQuery.trim(), page: 1 });
  }

  function normalizeProduct(product) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.title_ar || product.name || "",
      price: Number(product.price_mad || product.price || 0),
      seller_id: product.seller_id || null,
      seller: product.seller_name || product.seller || "Souq Rahba",
      city: product.city || "",
      rating: Number(product.rating_avg || product.rating || 0),
      reviews: Number(product.reviews_count || product.reviews || 0),
      stock: Number(product.stock || 0),
      badge: product.featured ? "مميز" : product.status || "",
      description: product.description_ar || product.description || "",
      image_url: product.image_url || ""
    };
  }

  function handleAddToCart(product) {
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function handleGoToCheckout(product) {
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  function handleOpenProduct(product) {
    if (product?.slug) {
      navigate(`/products/${product.slug}`);
      return;
    }

    setMessage("تعذر فتح صفحة المنتج");
  }

  const hasFilters = useMemo(() => {
    return Boolean(q || category || sort !== "newest");
  }, [q, category, sort]);

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.title}>المنتجات</h1>
            <p style={styles.subtitle}>
              اكتشف المنتجات، صفِّ النتائج، وأضف ما يناسبك إلى السلة أو أكمل الشراء عبر Checkout.
            </p>
          </div>

          <div style={styles.heroMeta}>
            <span style={styles.heroChip}>
              {pagination.total} منتج
            </span>
            <span style={styles.heroChipMuted}>
              {hasFilters ? "نتائج مطابقة للتصفية الحالية" : "كل منتجات السوق"}
            </span>
          </div>
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.filtersGrid}>
            <input
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="ابحث عن منتج..."
              style={styles.input}
            />

            <select
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
              style={styles.input}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
              style={styles.input}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button onClick={applySearch} style={styles.primaryFilterBtn}>
              تطبيق
            </button>

            <button onClick={clearFilters} style={styles.secondaryFilterBtn}>
              مسح
            </button>
          </div>
        </div>

        {message ? <div style={styles.messageBox}>{message}</div> : null}

        {loading ? (
          <div style={styles.stateCard}>جاري تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <div style={styles.stateCard}>
            لا توجد منتجات مطابقة حالياً.
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => {
              const item = normalizeProduct(product);

              return (
                <article key={product.id} style={styles.card}>
                  <div style={styles.imageWrap}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noImage}>No image</div>
                    )}

                    {item.badge ? (
                      <div style={styles.badge}>{item.badge}</div>
                    ) : null}
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.metaRow}>
                      <span style={styles.sellerName}>{item.seller}</span>
                      {item.rating > 0 ? (
                        <span style={styles.rating}>
                          ⭐ {item.rating} ({item.reviews})
                        </span>
                      ) : (
                        <span style={styles.ratingMuted}>جديد</span>
                      )}
                    </div>

                    <h3 style={styles.productTitle}>{item.name}</h3>

                    <p style={styles.description}>
                      {item.description || "بدون وصف"}
                    </p>

                    <div style={styles.priceRow}>
                      <strong style={styles.price}>{item.price} MAD</strong>
                      <span
                        style={{
                          ...styles.stock,
                          color: item.stock > 0 ? "#166534" : "#b91c1c"
                        }}
                      >
                        {item.stock > 0
                          ? `المخزون: ${item.stock}`
                          : "غير متوفر"}
                      </span>
                    </div>

                    <div style={styles.actions}>
                      <button
                        onClick={() => handleOpenProduct(product)}
                        style={styles.outlineBtn}
                      >
                        التفاصيل
                      </button>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...styles.secondaryBtn,
                          ...(item.stock <= 0 ? styles.disabledBtn : {})
                        }}
                      >
                        {item.stock <= 0 ? "غير متوفر" : "أضف إلى السلة"}
                      </button>

                      <button
                        onClick={() => handleGoToCheckout(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...styles.primaryBtn,
                          ...(item.stock <= 0 ? styles.disabledBtn : {})
                        }}
                      >
                        شراء عبر Checkout
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 ? (
          <div style={styles.pagination}>
            <button
              onClick={() => updateFilters({ page: Math.max(page - 1, 1) })}
              disabled={page <= 1}
              style={{
                ...styles.pagerBtn,
                ...(page <= 1 ? styles.disabledBtn : {})
              }}
            >
              السابق
            </button>

            <div style={styles.pageInfo}>
              صفحة {pagination.page} من {pagination.pages}
            </div>

            <button
              onClick={() =>
                updateFilters({ page: Math.min(page + 1, pagination.pages) })
              }
              disabled={page >= pagination.pages}
              style={{
                ...styles.pagerBtn,
                ...(page >= pagination.pages ? styles.disabledBtn : {})
              }}
            >
              التالي
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "18px"
  },
  hero: {
    display: "grid",
    gap: "12px"
  },
  title: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900,
    fontSize: "32px"
  },
  subtitle: {
    margin: 0,
    color: "#6b6156",
    lineHeight: 1.8
  },
  heroMeta: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  heroChip: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#17407c",
    fontWeight: 800,
    fontSize: "13px"
  },
  heroChipMuted: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#f7f3ee",
    color: "#7a6e61",
    fontWeight: 700,
    fontSize: "13px"
  },
  filtersCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 10px 26px rgba(21,41,76,0.06)"
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto auto",
    gap: "10px"
  },
  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d8cec1",
    background: "#fffdfa",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none"
  },
  primaryFilterBtn: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#173b74",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryFilterBtn: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer"
  },
  messageBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #f4d6a5",
    background: "#fff8ee",
    color: "#9a4f18",
    fontWeight: 700
  },
  stateCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
    color: "#5f554a"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 12px 28px rgba(23,59,116,0.06)",
    display: "grid"
  },
  imageWrap: {
    position: "relative"
  },
  image: {
    width: "100%",
    height: "210px",
    objectFit: "cover",
    display: "block"
  },
  noImage: {
    width: "100%",
    height: "210px",
    background: "#f8fafc",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8"
  },
  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(23,59,116,0.92)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800
  },
  cardBody: {
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center"
  },
  sellerName: {
    color: "#6b6156",
    fontSize: "13px",
    fontWeight: 700
  },
  rating: {
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: 800
  },
  ratingMuted: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700
  },
  productTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: 900,
    lineHeight: 1.5
  },
  description: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.8,
    minHeight: "52px"
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  price: {
    color: "#173b74",
    fontSize: "20px"
  },
  stock: {
    fontSize: "13px",
    fontWeight: 800
  },
  actions: {
    display: "grid",
    gap: "10px"
  },
  outlineBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer"
  },
  primaryBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#173b74",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },
  disabledBtn: {
    opacity: 0.55,
    cursor: "not-allowed"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  pagerBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },
  pageInfo: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    fontWeight: 800
  }
};
