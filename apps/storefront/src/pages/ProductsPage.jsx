import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "featured", label: "المميزة" },
  { value: "price_asc", label: "السعر: الأقل أولاً" },
  { value: "price_desc", label: "السعر: الأعلى أولاً" },
  { value: "stock_desc", label: "الأكثر توفراً" }
];

const CATEGORY_OPTIONS = [
  { value: "", label: "كل الفئات" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "appliances", label: "أجهزة منزلية" },
  { value: "tools", label: "أدوات ومعدات" },
  { value: "agriculture", label: "فلاحة" },
  { value: "fishing", label: "صيد وبحر" },
  { value: "construction", label: "بناء" },
  { value: "fashion", label: "أزياء" },
  { value: "food", label: "غذاء" }
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useApp();

  const [products, setProducts] = useState([]);
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 1
  });

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
      seller: product.seller_name || product.seller || "RAHBA",
      city: product.city || "",
      rating: Number(product.rating_avg || product.rating || 0),
      reviews: Number(product.reviews_count || product.reviews || 0),
      stock: Number(product.stock || 0),
      badge: product.featured ? "مميز" : product.status || "",
      description: product.description_ar || product.description || "",
      image_url: product.image_url || ""
    };
  }

  function openProduct(product) {
    if (!product?.slug) {
      setMessage("تعذر فتح صفحة المنتج");
      return;
    }
    navigate(`/products/${product.slug}`);
  }

  function addProductToCart(product) {
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function buyViaCheckout(product) {
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  const hasFilters = useMemo(() => {
    return Boolean(q || category || sort !== "newest");
  }, [q, category, sort]);

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.hero}>
          <div style={s.heroTextWrap}>
            <div style={s.heroBadge}>RAHBA MARKET</div>
            <h1 style={s.title}>اكتشف المنتجات المناسبة لك</h1>
            <p style={s.subtitle}>
              تصفح، صفِّ النتائج، شاهد التفاصيل، وأضف المنتجات إلى السلة أو أكمل الشراء مباشرة عبر Checkout.
            </p>
          </div>

          <div style={s.heroStats}>
            <div style={s.statCard}>
              <div style={s.statValue}>{pagination.total}</div>
              <div style={s.statLabel}>منتج</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{pagination.pages}</div>
              <div style={s.statLabel}>صفحة</div>
            </div>
            <div style={s.statCardMuted}>
              {hasFilters ? "نتائج حسب التصفية الحالية" : "عرض كل المنتجات"}
            </div>
          </div>
        </div>

        <div style={s.filtersCard}>
          <div style={s.filtersTop}>
            <div style={s.filtersTitle}>البحث والتصفية</div>
            <button onClick={clearFilters} style={s.clearBtn}>
              مسح الكل
            </button>
          </div>

          <div style={s.filtersGrid}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>⌕</span>
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch();
                }}
                placeholder="ابحث عن منتج..."
                style={s.searchInput}
              />
            </div>

            <select
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
              style={s.select}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
              style={s.select}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button onClick={applySearch} style={s.applyBtn}>
              تطبيق
            </button>
          </div>
        </div>

        {message ? <div style={s.messageBox}>{message}</div> : null}

        {loading ? (
          <div style={s.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={s.skeletonCard}>
                <div style={s.skeletonImage} />
                <div style={s.skeletonBody}>
                  <div style={s.skeletonLineLg} />
                  <div style={s.skeletonLine} />
                  <div style={s.skeletonLine} />
                  <div style={s.skeletonActions}>
                    <div style={s.skeletonBtn} />
                    <div style={s.skeletonBtn} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>📦</div>
            <h3 style={s.emptyTitle}>لا توجد نتائج حالياً</h3>
            <p style={s.emptyText}>
              جرّب تغيير كلمات البحث أو الفئة أو طريقة الترتيب.
            </p>
            <button onClick={clearFilters} style={s.primaryGhostBtn}>
              إعادة التصفية
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {products.map((product) => {
              const item = normalizeProduct(product);

              return (
                <article key={product.id} style={s.card}>
                  <div style={s.imageWrap}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={s.image}
                      />
                    ) : (
                      <div style={s.noImage}>No image</div>
                    )}

                    {item.badge ? <div style={s.badge}>{item.badge}</div> : null}
                  </div>

                  <div style={s.cardBody}>
                    <div style={s.metaRow}>
                      <span style={s.sellerName}>
                        {item.seller}
                        {item.city ? ` • ${item.city}` : ""}
                      </span>

                      {item.rating > 0 ? (
                        <span style={s.rating}>
                          ⭐ {item.rating} · {item.reviews}
                        </span>
                      ) : (
                        <span style={s.newTag}>جديد</span>
                      )}
                    </div>

                    <h3 style={s.productTitle}>{item.name}</h3>

                    <p style={s.description}>
                      {item.description || "بدون وصف متاح حالياً"}
                    </p>

                    <div style={s.priceRow}>
                      <strong style={s.price}>{item.price} MAD</strong>
                      <span
                        style={{
                          ...s.stock,
                          color: item.stock > 0 ? "#166534" : "#b91c1c"
                        }}
                      >
                        {item.stock > 0 ? `المخزون: ${item.stock}` : "غير متوفر"}
                      </span>
                    </div>

                    <div style={s.actions}>
                      <button
                        onClick={() => openProduct(product)}
                        style={s.outlineBtn}
                      >
                        التفاصيل
                      </button>

                      <button
                        onClick={() => addProductToCart(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...s.lightBtn,
                          ...(item.stock <= 0 ? s.disabledBtn : {})
                        }}
                      >
                        أضف إلى السلة
                      </button>

                      <button
                        onClick={() => buyViaCheckout(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...s.primaryBtn,
                          ...(item.stock <= 0 ? s.disabledBtn : {})
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
          <div style={s.pagination}>
            <button
              onClick={() => updateFilters({ page: Math.max(page - 1, 1) })}
              disabled={page <= 1}
              style={{
                ...s.pageBtn,
                ...(page <= 1 ? s.disabledBtn : {})
              }}
            >
              السابق
            </button>

            <div style={s.pageInfo}>
              صفحة {pagination.page} من {pagination.pages}
            </div>

            <button
              onClick={() =>
                updateFilters({ page: Math.min(page + 1, pagination.pages) })
              }
              disabled={page >= pagination.pages}
              style={{
                ...s.pageBtn,
                ...(page >= pagination.pages ? s.disabledBtn : {})
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

const s = {
  page: {
    display: "grid",
    gap: "22px"
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "18px",
    alignItems: "stretch"
  },
  heroTextWrap: {
    background:
      "linear-gradient(135deg, rgba(20,48,98,1) 0%, rgba(26,77,131,1) 58%, rgba(12,116,108,1) 100%)",
    color: "#fff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 18px 40px rgba(20,48,98,0.16)"
  },
  heroBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "14px"
  },
  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.2,
    fontWeight: 900
  },
  subtitle: {
    margin: "14px 0 0",
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.9)"
  },
  heroStats: {
    display: "grid",
    gap: "12px"
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 10px 24px rgba(22,42,73,0.06)"
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 900,
    color: "#173b74"
  },
  statLabel: {
    color: "#6d6358",
    fontWeight: 700
  },
  statCardMuted: {
    background: "#f8f5ef",
    border: "1px solid #e8ded1",
    borderRadius: "20px",
    padding: "18px",
    color: "#6d6358",
    fontWeight: 700,
    display: "flex",
    alignItems: "center"
  },
  filtersCard: {
    background: "#fff",
    border: "1px solid #e8ded1",
    borderRadius: "20px",
    padding: "16px",
    boxShadow: "0 10px 24px rgba(22,42,73,0.05)"
  },
  filtersTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "14px",
    flexWrap: "wrap"
  },
  filtersTitle: {
    fontWeight: 900,
    color: "#173b74"
  },
  clearBtn: {
    border: "1px solid #d4d4d8",
    background: "#fff",
    color: "#374151",
    borderRadius: "12px",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto",
    gap: "10px"
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #d8cec1",
    borderRadius: "14px",
    padding: "0 14px",
    background: "#fffdfa"
  },
  searchIcon: {
    color: "#7c6f63",
    fontSize: "18px"
  },
  searchInput: {
    flex: 1,
    padding: "13px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "14px"
  },
  select: {
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d8cec1",
    background: "#fffdfa",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none"
  },
  applyBtn: {
    border: "none",
    background: "#173b74",
    color: "#fff",
    borderRadius: "14px",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer"
  },
  messageBox: {
    padding: "13px 15px",
    borderRadius: "14px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a4f18",
    fontWeight: 700
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  skeletonCard: {
    background: "#fff",
    border: "1px solid #e8ded1",
    borderRadius: "20px",
    overflow: "hidden"
  },
  skeletonImage: {
    height: "220px",
    background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)"
  },
  skeletonBody: {
    padding: "16px",
    display: "grid",
    gap: "10px"
  },
  skeletonLineLg: {
    height: "18px",
    borderRadius: "8px",
    background: "#eceff3",
    width: "72%"
  },
  skeletonLine: {
    height: "14px",
    borderRadius: "8px",
    background: "#f1f5f9",
    width: "100%"
  },
  skeletonActions: {
    display: "grid",
    gap: "8px",
    marginTop: "6px"
  },
  skeletonBtn: {
    height: "42px",
    borderRadius: "12px",
    background: "#f3f4f6"
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e8ded1",
    borderRadius: "24px",
    padding: "34px",
    textAlign: "center",
    boxShadow: "0 12px 28px rgba(22,42,73,0.05)"
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px"
  },
  emptyTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900
  },
  emptyText: {
    color: "#6d6358",
    marginTop: "10px"
  },
  primaryGhostBtn: {
    marginTop: "14px",
    border: "none",
    background: "#173b74",
    color: "#fff",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
    gap: "22px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e8ded1",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 14px 34px rgba(23,59,116,0.06)",
    display: "grid"
  },
  imageWrap: {
    position: "relative"
  },
  image: {
    width: "100%",
    height: "230px",
    objectFit: "cover",
    display: "block"
  },
  noImage: {
    width: "100%",
    height: "230px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    color: "#94a3b8"
  },
  badge: {
    position: "absolute",
    top: "14px",
    left: "14px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(23,59,116,0.95)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 900
  },
  cardBody: {
    padding: "18px",
    display: "grid",
    gap: "12px"
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  sellerName: {
    color: "#6d6358",
    fontSize: "13px",
    fontWeight: 700
  },
  rating: {
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: 900
  },
  newTag: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800
  },
  productTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: 900,
    lineHeight: 1.5,
    minHeight: "54px"
  },
  description: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.8,
    minHeight: "52px",
    fontSize: "14px"
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
    fontSize: "22px",
    fontWeight: 900
  },
  stock: {
    fontSize: "13px",
    fontWeight: 900
  },
  actions: {
    display: "grid",
    gap: "10px"
  },
  outlineBtn: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer"
  },
  lightBtn: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #d6e1ee",
    background: "#f8fbff",
    color: "#173b74",
    fontWeight: 900,
    cursor: "pointer"
  },
  primaryBtn: {
    padding: "13px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #173b74 0%, #1d5c97 55%, #0f766e 100%)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(23,59,116,0.14)"
  },
  disabledBtn: {
    opacity: 0.55,
    cursor: "not-allowed"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  pageBtn: {
    padding: "11px 14px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer"
  },
  pageInfo: {
    padding: "11px 14px",
    borderRadius: "14px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    fontWeight: 900,
    color: "#173b74"
  }
};
