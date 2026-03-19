import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

const PAGE_LIMIT = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "featured", label: "مميزة" },
  { value: "price_asc", label: "السعر ↑" },
  { value: "price_desc", label: "السعر ↓" }
];

const CATEGORY_OPTIONS = [
  { value: "", label: "كل الفئات" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "appliances", label: "أجهزة" },
  { value: "tools", label: "أدوات" },
  { value: "agriculture", label: "فلاحة" },
  { value: "fishing", label: "صيد" },
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
      setMessage("تعذر فتح المنتج");
      return;
    }
    navigate(`/products/${product.slug}`);
  }

  function handleAddToCart(product) {
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function handleCheckout(product) {
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  const activeFilters = useMemo(() => {
    const items = [];
    if (q) items.push(`بحث: ${q}`);
    if (category) {
      const cat = CATEGORY_OPTIONS.find((x) => x.value === category);
      if (cat) items.push(cat.label);
    }
    if (sort && sort !== "newest") {
      const s = SORT_OPTIONS.find((x) => x.value === sort);
      if (s) items.push(`ترتيب: ${s.label}`);
    }
    return items;
  }, [q, category, sort]);

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.topBlock}>
          <div style={s.topBadge}>RAHBA PRODUCTS</div>
          <h1 style={s.title}>المنتجات</h1>
          <p style={s.subtitle}>
            تصفح المنتجات بسرعة من الهاتف، أضف للسلة، أو افتح التفاصيل قبل إتمام الطلب.
          </p>
        </div>

        <div style={s.searchCard}>
          <div style={s.searchRow}>
            <input
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="ابحث عن منتج..."
              style={s.searchInput}
            />
            <button onClick={applySearch} style={s.searchBtn}>
              بحث
            </button>
          </div>

          <div style={s.filtersRow}>
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
          </div>

          <div style={s.metaRow}>
            <div style={s.countPill}>{pagination.total} منتج</div>
            <button onClick={clearFilters} style={s.clearBtn}>
              مسح
            </button>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div style={s.chipsWrap}>
            {activeFilters.map((item, index) => (
              <span key={`${item}-${index}`} style={s.chip}>
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {message ? <div style={s.messageBox}>{message}</div> : null}

        {loading ? (
          <div style={s.list}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={s.skeletonCard}>
                <div style={s.skeletonImage} />
                <div style={s.skeletonBody}>
                  <div style={s.skeletonLineLg} />
                  <div style={s.skeletonLine} />
                  <div style={s.skeletonLineSm} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>📦</div>
            <h3 style={s.emptyTitle}>لا توجد نتائج</h3>
            <p style={s.emptyText}>
              جرّب تغيير البحث أو الفئة أو إعادة ترتيب النتائج.
            </p>
            <button onClick={clearFilters} style={s.emptyBtn}>
              إعادة التصفية
            </button>
          </div>
        ) : (
          <div style={s.list}>
            {products.map((product) => {
              const item = normalizeProduct(product);

              return (
                <article key={product.id} style={s.card}>
                  <div style={s.cardMedia}>
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
                    <div style={s.cardTopRow}>
                      <div style={s.sellerText}>
                        {item.seller}
                        {item.city ? ` • ${item.city}` : ""}
                      </div>

                      {item.rating > 0 ? (
                        <div style={s.ratingText}>
                          ⭐ {item.rating} ({item.reviews})
                        </div>
                      ) : (
                        <div style={s.newText}>جديد</div>
                      )}
                    </div>

                    <h3 style={s.productTitle}>{item.name}</h3>

                    <p style={s.description}>
                      {item.description || "بدون وصف متاح حالياً"}
                    </p>

                    <div style={s.infoRow}>
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
                        style={s.detailsBtn}
                      >
                        التفاصيل
                      </button>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...s.cartBtn,
                          ...(item.stock <= 0 ? s.disabledBtn : {})
                        }}
                      >
                        أضف للسلة
                      </button>

                      <button
                        onClick={() => handleCheckout(product)}
                        disabled={item.stock <= 0}
                        style={{
                          ...s.checkoutBtn,
                          ...(item.stock <= 0 ? s.disabledBtn : {})
                        }}
                      >
                        Checkout
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
              {pagination.page} / {pagination.pages}
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
    gap: "16px",
    maxWidth: "760px",
    margin: "0 auto"
  },
  topBlock: {
    display: "grid",
    gap: "8px"
  },
  topBadge: {
    justifySelf: "start",
    background: "#eef6ff",
    color: "#173b74",
    borderRadius: "999px",
    padding: "7px 12px",
    fontWeight: 800,
    fontSize: "12px"
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#173b74",
    fontWeight: 900
  },
  subtitle: {
    margin: 0,
    color: "#6b6156",
    lineHeight: 1.8,
    fontSize: "15px"
  },
  searchCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "20px",
    padding: "14px",
    boxShadow: "0 10px 24px rgba(23,59,116,0.05)",
    display: "grid",
    gap: "10px"
  },
  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px"
  },
  searchInput: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d8cec1",
    background: "#fffdfa",
    fontSize: "15px",
    outline: "none",
    fontFamily: "inherit"
  },
  searchBtn: {
    border: "none",
    borderRadius: "14px",
    padding: "0 18px",
    background: "#173b74",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    minHeight: "48px"
  },
  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  select: {
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d8cec1",
    background: "#fffdfa",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit"
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center"
  },
  countPill: {
    background: "#f5f8fc",
    color: "#173b74",
    borderRadius: "999px",
    padding: "8px 12px",
    fontWeight: 800,
    fontSize: "13px"
  },
  clearBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: "12px",
    padding: "9px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  chipsWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  chip: {
    background: "#f7f3ee",
    color: "#6d6358",
    borderRadius: "999px",
    padding: "7px 11px",
    fontWeight: 700,
    fontSize: "12px"
  },
  messageBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a4f18",
    fontWeight: 700
  },
  list: {
    display: "grid",
    gap: "14px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 12px 26px rgba(23,59,116,0.06)"
  },
  cardMedia: {
    position: "relative"
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    display: "block"
  },
  noImage: {
    width: "100%",
    height: "220px",
    background: "#f8fafc",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8"
  },
  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "rgba(23,59,116,0.94)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 900
  },
  cardBody: {
    padding: "16px",
    display: "grid",
    gap: "10px"
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  sellerText: {
    color: "#6d6358",
    fontSize: "13px",
    fontWeight: 700
  },
  ratingText: {
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: 900
  },
  newText: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800
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
    fontSize: "14px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
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
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginTop: "4px"
  },
  detailsBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    borderRadius: "14px",
    minHeight: "44px",
    fontWeight: 900,
    cursor: "pointer"
  },
  cartBtn: {
    border: "1px solid #d6e1ee",
    background: "#f8fbff",
    color: "#173b74",
    borderRadius: "14px",
    minHeight: "44px",
    fontWeight: 900,
    cursor: "pointer"
  },
  checkoutBtn: {
    border: "none",
    background: "linear-gradient(135deg, #173b74 0%, #1d5c97 55%, #0f766e 100%)",
    color: "#fff",
    borderRadius: "14px",
    minHeight: "44px",
    fontWeight: 900,
    cursor: "pointer"
  },
  disabledBtn: {
    opacity: 0.55,
    cursor: "not-allowed"
  },
  skeletonCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "22px",
    overflow: "hidden"
  },
  skeletonImage: {
    height: "220px",
    background: "#eef2f7"
  },
  skeletonBody: {
    padding: "16px",
    display: "grid",
    gap: "10px"
  },
  skeletonLineLg: {
    height: "18px",
    borderRadius: "10px",
    background: "#eceff3",
    width: "70%"
  },
  skeletonLine: {
    height: "14px",
    borderRadius: "10px",
    background: "#f1f5f9",
    width: "100%"
  },
  skeletonLineSm: {
    height: "14px",
    borderRadius: "10px",
    background: "#f1f5f9",
    width: "55%"
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e7ddcf",
    borderRadius: "24px",
    padding: "30px 22px",
    textAlign: "center",
    boxShadow: "0 12px 28px rgba(22,42,73,0.05)"
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "8px"
  },
  emptyTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900
  },
  emptyText: {
    color: "#6d6358",
    marginTop: "10px",
    lineHeight: 1.8
  },
  emptyBtn: {
    marginTop: "14px",
    border: "none",
    background: "#173b74",
    color: "#fff",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "8px"
  },
  pageBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    borderRadius: "14px",
    minHeight: "44px",
    padding: "0 14px",
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
