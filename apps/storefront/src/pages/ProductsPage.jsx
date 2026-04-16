import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import ProductCard from "../components/marketplace/ProductCard";
import { UI } from "../components/marketplace/uiTokens";
import { normalizeMarketplaceProducts } from "../utils/marketplaceProductMapper";

const PAGE_LIMIT = 10;
const VIEW_MODE_STORAGE_KEY = "rahba.products.viewMode";

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "featured", label: "مميزة" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("comfortable");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    setDraftQuery(q);
  }, [q]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "comfortable" || stored === "compact") {
        setViewMode(stored);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (err) {
      console.error(err);
    }
  }, [viewMode]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const result = await apiGet("/catalog/categories");
        const items = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        setCategories(items);
      } catch (err) {
        console.error(err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");
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
          pages: 1,
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
          pages: 1,
        });
        setErrorMessage("تعذر تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [q, category, sort, page]);

  const categoryOptions = useMemo(() => {
    const dynamic = categories.map((cat) => ({
      value: cat.slug || "",
      label: cat.name_ar || cat.name || cat.slug || "فئة",
    }));

    return [{ value: "", label: "كل الفئات" }, ...dynamic];
  }, [categories]);

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
    setErrorMessage("");
    setSearchParams({
      sort: "newest",
      page: "1",
    });
  }

  function applySearch() {
    updateFilters({ q: draftQuery.trim(), page: 1 });
  }

  const activeFilters = useMemo(() => {
    const items = [];

    if (q) {
      items.push(`بحث: ${q}`);
    }

    if (category) {
      const cat = categoryOptions.find((x) => x.value === category);
      if (cat) {
        items.push(cat.label);
      }
    }

    if (sort && sort !== "newest") {
      const s = SORT_OPTIONS.find((x) => x.value === sort);
      if (s) {
        items.push(`ترتيب: ${s.label}`);
      }
    }

    return items;
  }, [q, category, sort, categoryOptions]);

  const normalizedProducts = useMemo(
    () => normalizeMarketplaceProducts(products),
    [products]
  );

  const topCategoryChips = useMemo(() => {
    return categoryOptions.filter((item) => item.value).slice(0, 8);
  }, [categoryOptions]);

  const productsGridStyle = useMemo(() => {
    return {
      ...styles.productsGrid,
      gridTemplateColumns:
        viewMode === "compact"
          ? "repeat(auto-fill, minmax(210px, 1fr))"
          : "repeat(auto-fill, minmax(250px, 1fr))",
    };
  }, [viewMode]);

  const skeletonItems = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.stack}>
        <SectionShell style={styles.heroShell}>
          <div style={styles.heroBadge}>RAHBA PRODUCTS</div>

          <SectionHead
            title="تصفح المنتجات"
            subtitle="ابحث، صفِّ، وقارن بسرعة داخل رحبة، ثم انتقل مباشرة إلى المنتج المناسب بثقة ووضوح."
          />

          <div style={styles.heroMetaRow}>
            <div className="ui-chip">{pagination.total} منتج</div>
            {categoriesLoading ? (
              <div className="ui-chip">جاري تحميل الفئات...</div>
            ) : (
              <div className="ui-chip">{Math.max(categoryOptions.length - 1, 0)} فئة</div>
            )}
            <div className="ui-chip">تجربة بحث أوضح</div>
          </div>
        </SectionShell>

        <SectionShell style={styles.filtersShell}>
          <div style={styles.filtersHead}>
            <SectionHead
              chip="FILTERS"
              title="ابحث وصفِّ النتائج"
              subtitle="استعمل البحث والفئات والترتيب للوصول بسرعة إلى المنتج المناسب."
            />
          </div>

          <div style={styles.filtersGrid}>
            <div style={styles.searchBlock}>
              <label style={styles.fieldLabel}>ابحث عن منتج</label>
              <div style={styles.searchRow}>
                <input
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applySearch();
                    }
                  }}
                  placeholder="مثلاً: هاتف، خلاط، أدوات..."
                  className="ui-input"
                />
                <button onClick={applySearch} className="btn btn-primary">
                  بحث
                </button>
              </div>
            </div>

            <div style={styles.filterCols}>
              <div style={styles.selectBlock}>
                <label style={styles.fieldLabel}>الفئة</label>
                <select
                  value={category}
                  onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
                  className="ui-select"
                  disabled={categoriesLoading}
                >
                  {categoryOptions.map((option) => (
                    <option key={`${option.value}-${option.label}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.selectBlock}>
                <label style={styles.fieldLabel}>الترتيب</label>
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
            </div>

            <div style={styles.quickCategoriesRow}>
              <span style={styles.quickCategoriesLabel}>فئات سريعة:</span>
              <div style={styles.quickCategoriesWrap}>
                {topCategoryChips.map((item) => {
                  const active = item.value === category;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateFilters({ category: item.value, page: 1 })}
                      style={{
                        ...styles.quickCategoryChip,
                        ...(active ? styles.quickCategoryChipActive : {}),
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={styles.filtersFooter}>
            <div style={styles.chipsWrap}>
              {activeFilters.length > 0 ? (
                activeFilters.map((item, index) => (
                  <span key={`${item}-${index}`} className="ui-chip">
                    {item}
                  </span>
                ))
              ) : (
                <span className="ui-chip">بدون فلاتر إضافية</span>
              )}
              <span className="ui-chip">عدد الفلاتر النشطة: {activeFilters.length}</span>
            </div>

            <button onClick={clearFilters} className="btn btn-soft">
              مسح الفلاتر
            </button>
          </div>
        </SectionShell>

        {message ? <div className="message-box">{message}</div> : null}
        {errorMessage ? <div className="message-box">{errorMessage}</div> : null}

        {loading ? (
          <SectionShell>
            <div style={styles.loadingGrid} aria-live="polite">
              {skeletonItems.map((_, index) => (
                <div key={index} style={styles.loadingCard} />
              ))}
            </div>
          </SectionShell>
        ) : normalizedProducts.length === 0 ? (
          <SectionShell style={styles.emptyShell}>
            <div style={styles.emptyStateWrap}>
              <div className="empty-state">لا توجد نتائج مطابقة للفلاتر الحالية.</div>
              <button type="button" className="btn btn-soft" onClick={clearFilters}>
                إعادة ضبط البحث
              </button>
            </div>
          </SectionShell>
        ) : (
          <SectionShell style={styles.resultsShell}>
            <div style={styles.resultsHead}>
              <SectionHead
                chip="RESULTS"
                title="نتائج التصفح"
                subtitle="اختر المنتج المناسب وادخل إلى التفاصيل لمزيد من المعلومات قبل اتخاذ قرار الشراء."
              />

              <div style={styles.resultsMeta}>
                <span className="ui-chip">{pagination.total} نتيجة</span>
                <span className="ui-chip">عرض أوضح</span>
                <div style={styles.viewModeToggle}>
                  <button
                    type="button"
                    className="btn btn-soft"
                    style={{
                      ...styles.viewBtnMode,
                      ...(viewMode === "comfortable" ? styles.viewBtnModeActive : {}),
                    }}
                    onClick={() => setViewMode("comfortable")}
                  >
                    مريح
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft"
                    style={{
                      ...styles.viewBtnMode,
                      ...(viewMode === "compact" ? styles.viewBtnModeActive : {}),
                    }}
                    onClick={() => setViewMode("compact")}
                  >
                    مكثف
                  </button>
                </div>
              </div>
            </div>

            <div style={productsGridStyle}>
              {normalizedProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug || product.name}
                  product={product}
                />
              ))}
            </div>
          </SectionShell>
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

            <div style={styles.pageIndicator}>
              صفحة {pagination.page} من {pagination.pages}
            </div>

            <button
              onClick={() => updateFilters({ page: Math.min(page + 1, pagination.pages) })}
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
  stack: {
    display: "grid",
    gap: UI.spacing.pageGap,
  },

  heroShell: {
    background: "linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%)",
    border: `1px solid ${UI.colors.border}`,
    boxShadow: "0 18px 42px rgba(11,15,26,0.05)",
  },

  heroBadge: {
    width: "fit-content",
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    display: "inline-flex",
    alignItems: "center",
    background: UI.colors.softBlue,
    color: UI.colors.navy,
    border: "1px solid #dbeafe",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },

  heroMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  filtersShell: {
    display: "grid",
    gap: "18px",
    background: "#ffffff",
    position: "sticky",
    top: "12px",
    zIndex: 2,
    alignSelf: "start",
    maxHeight: "calc(100vh - 24px)",
    overflowY: "auto",
  },

  filtersHead: {
    display: "grid",
    gap: "10px",
  },

  filtersGrid: {
    display: "grid",
    gap: "16px",
  },

  searchBlock: {
    display: "grid",
    gap: "10px",
  },

  fieldLabel: {
    color: UI.colors.ink,
    fontSize: UI.type.bodySm,
    fontWeight: 900,
  },

  searchRow: {
    display: "grid",
    gap: "10px",
  },

  filterCols: {
    display: "grid",
    gap: "12px",
  },

  quickCategoriesRow: {
    display: "grid",
    gap: "8px",
  },

  quickCategoriesLabel: {
    color: UI.colors.muted,
    fontWeight: 700,
    fontSize: UI.type.caption,
  },

  quickCategoriesWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  quickCategoryChip: {
    minHeight: "34px",
    borderRadius: UI.radius.pill,
    border: `1px solid ${UI.colors.border}`,
    background: "#fff",
    color: UI.colors.navy,
    padding: "0 12px",
    fontSize: UI.type.caption,
    fontWeight: 800,
    cursor: "pointer",
  },

  quickCategoryChipActive: {
    border: "1px solid #1e5fa8",
    background: "#eaf2fd",
    color: "#123664",
  },

  selectBlock: {
    display: "grid",
    gap: "10px",
  },

  filtersFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  chipsWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  emptyShell: {
    background: "#fffdfa",
  },

  emptyStateWrap: {
    display: "grid",
    gap: "12px",
    justifyItems: "center",
  },

  resultsShell: {
    display: "grid",
    gap: "18px",
    background: "linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%)",
    border: `1px solid ${UI.colors.border}`,
    boxShadow: "0 18px 42px rgba(11,15,26,0.05)",
  },

  resultsHead: {
    display: "grid",
    gap: "12px",
  },

  resultsMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  productsGrid: {
    display: "grid",
    gap: UI.spacing.cardGap,
  },

  viewModeToggle: {
    display: "inline-flex",
    gap: "6px",
  },

  viewBtnMode: {
    minHeight: "34px",
    borderRadius: UI.radius.pill,
    padding: "0 12px",
    fontSize: UI.type.caption,
  },

  viewBtnModeActive: {
    background: "#eaf2fd",
    border: "1px solid #bfd6f3",
    color: UI.colors.navy,
  },

  loadingGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
  },

  loadingCard: {
    minHeight: "260px",
    borderRadius: UI.radius.xxl,
    background: "linear-gradient(90deg, #f4efe5 0%, #ebe3d4 50%, #f4efe5 100%)",
    backgroundSize: "200% 100%",
    animation: "rahbaPulse 1.2s ease-in-out infinite",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  pageIndicator: {
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: UI.radius.lg,
    background: "#ffffff",
    border: `1px solid ${UI.colors.border}`,
    color: UI.colors.navy,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(11,15,26,0.04)",
  },
};
