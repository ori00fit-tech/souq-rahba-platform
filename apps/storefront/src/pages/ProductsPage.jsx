import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "@rahba/shared";
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
      <div className="page-stack">
        <div className="ui-card" style={styles.heroCard}>
          <div className="ui-chip">RAHBA PRODUCTS</div>
          <h1 className="page-title">المنتجات</h1>
          <p className="page-subtitle">
            تصفح المنتجات بسرعة من الهاتف، أضف للسلة، أو افتح التفاصيل قبل إتمام الطلب.
          </p>
        </div>

        <div className="ui-card" style={styles.filtersCard}>
          <div style={styles.searchRow}>
            <input
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="ابحث عن منتج..."
              className="ui-input"
            />
            <button onClick={applySearch} className="btn btn-primary">
              بحث
            </button>
          </div>

          <div style={styles.selectRow}>
            <select
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
              className="ui-select"
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
              className="ui-select"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.metaRow}>
            <div className="ui-chip">{pagination.total} منتج</div>
            <button onClick={clearFilters} className="btn btn-soft">
              مسح
            </button>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div style={styles.chipsWrap}>
            {activeFilters.map((item, index) => (
              <span key={`${item}-${index}`} className="ui-chip">
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {message ? <div className="message-box">{message}</div> : null}

        {loading ? (
          <div className="loading-state">جاري تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">لا توجد نتائج حالياً</div>
        ) : (
          <div className="product-list">
            {products.map((product) => {
              const item = normalizeProduct(product);

              return (
                <article key={product.id} className="product-card">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="product-card__image"
                    />
                  ) : (
                    <div className="product-card__image" style={styles.noImage}>
                      No image
                    </div>
                  )}

                  <div className="product-card__body">
                    <div className="product-card__meta">
                      <span>
                        {item.seller}
                        {item.city ? ` • ${item.city}` : ""}
                      </span>

                      {item.rating > 0 ? (
                        <span>⭐ {item.rating} ({item.reviews})</span>
                      ) : (
                        <span>جديد</span>
                      )}
                    </div>

                    <h3 className="product-card__title">{item.name}</h3>

                    <p className="product-card__desc">
                      {item.description || "بدون وصف متاح حالياً"}
                    </p>

                    <div style={styles.priceRow}>
                      <strong className="product-card__price">{item.price} MAD</strong>
                      <span
                        style={{
                          ...styles.stock,
                          color: item.stock > 0 ? "#166534" : "#b91c1c"
                        }}
                      >
                        {item.stock > 0 ? `المخزون: ${item.stock}` : "غير متوفر"}
                      </span>
                    </div>

                    <div style={styles.actions}>
                      <button onClick={() => openProduct(product)} className="btn btn-outline">
                        التفاصيل
                      </button>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={item.stock <= 0}
                        className="btn btn-secondary"
                      >
                        أضف للسلة
                      </button>

                      <button
                        onClick={() => handleCheckout(product)}
                        disabled={item.stock <= 0}
                        className="btn btn-primary"
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
          <div style={styles.pagination}>
            <button
              onClick={() => updateFilters({ page: Math.max(page - 1, 1) })}
              disabled={page <= 1}
              className="btn btn-soft"
            >
              السابق
            </button>

            <div className="ui-chip">
              {pagination.page} / {pagination.pages}
            </div>

            <button
              onClick={() =>
                updateFilters({ page: Math.min(page + 1, pagination.pages) })
              }
              disabled={page >= pagination.pages}
              className="btn btn-soft"
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
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "10px"
  },
  filtersCard: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px"
  },
  selectRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },
  chipsWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  noImage: {
    display: "grid",
    placeItems: "center",
    color: "#94a3b8"
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  stock: {
    fontSize: "13px",
    fontWeight: 900
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "6px"
  }
};
