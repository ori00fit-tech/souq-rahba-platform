import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import ProductCard from "../components/marketplace/ProductCard";
import { UI } from "../components/marketplace/uiTokens";
import { normalizeMarketplaceProducts } from "../utils/marketplaceProductMapper";

const PAGE_LIMIT = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "featured", label: "مميزة" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" }
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
      label: cat.name_ar || cat.name || cat.slug || "فئة"
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
      page: "1"
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

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.stack}>
        <SectionShell style={styles.heroShell}>
          <div className="ui-chip">RAHBA PRODUCTS</div>
          <SectionHead
            title="تصفح المنتجات"
            subtitle="ابحث، صفِّ، قارن بسرعة، ثم انتقل إلى المنتج المناسب داخل رحبة."
          />

          <div style={styles.heroMetaRow}>
            <div className="ui-chip">{pagination.total} منتج</div>
            {categoriesLoading ? <div className="ui-chip">جاري تحميل الفئات...</div> : null}
          </div>
        </SectionShell>

        <SectionShell>
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
            <div className="loading-state">جاري تحميل المنتجات...</div>
          </SectionShell>
        ) : normalizedProducts.length === 0 ? (
          <SectionShell>
            <div className="empty-state">لا توجد نتائج حالياً</div>
          </SectionShell>
        ) : (
          <SectionShell>
            <div style={styles.resultsHead}>
              <SectionHead
                chip="RESULTS"
                title="نتائج التصفح"
                subtitle="اختر المنتج المناسب وادخل إلى التفاصيل لمزيد من المعلومات."
              />
            </div>

            <div style={styles.productsGrid}>
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
  stack: {
    display: "grid",
    gap: "26px"
  },

  heroShell: {
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.06) 0%, rgba(20,184,166,0.06) 100%)",
    border: "1px solid #dfe7f3"
  },

  heroMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  filtersGrid: {
    display: "grid",
    gap: UI.spacing.sectionGap
  },

  searchBlock: {
    display: "grid",
    gap: "8px"
  },

  fieldLabel: {
    color: UI.colors.navy,
    fontSize: UI.type.bodySm,
    fontWeight: 800
  },

  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px"
  },

  filterCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },

  selectBlock: {
    display: "grid",
    gap: "8px"
  },

  filtersFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  chipsWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  resultsHead: {
    display: "grid",
    gap: "8px"
  },

  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: UI.spacing.cardGap
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "6px"
  }
};
