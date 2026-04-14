import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import ProductCard from "../components/marketplace/ProductCard";
import { UI } from "../components/marketplace/uiTokens";
import { normalizeMarketplaceProducts } from "../utils/marketplaceProductMapper";

const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "featured", label: "مميزة" },
  { value: "price_asc", label: "السعر: الأقل" },
  { value: "price_desc", label: "السعر: الأعلى" }
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
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
        const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
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
        setPagination({ page: 1, limit: PAGE_LIMIT, total: 0, pages: 1 });
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
    setErrorMessage("");
    setSearchParams({ sort: "newest", page: "1" });
  }

  function applySearch() {
    updateFilters({ q: draftQuery.trim(), page: 1 });
  }

  const normalizedProducts = useMemo(
    () => normalizeMarketplaceProducts(products),
    [products]
  );

  const hasActiveFilters = q || category || (sort && sort !== "newest");

  return (
    <main className="container section-space" dir="rtl">
      <div style={s.stack}>
        {/* Page Header */}
        <div style={s.header}>
          <h1 style={s.pageTitle}>المنتجات</h1>
          <p style={s.pageSubtitle}>تصفح {pagination.total} منتج من باعة موثوقين</p>
        </div>

        {/* Filters Section */}
        <SectionShell variant="elevated">
          <div style={s.filtersGrid}>
            {/* Search */}
            <div style={s.searchWrap}>
              <SearchIcon />
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="ابحث عن منتج..."
                style={s.searchInput}
              />
              <button onClick={applySearch} style={s.searchBtn}>
                بحث
              </button>
            </div>

            {/* Filter Row */}
            <div style={s.filterRow}>
              <div style={s.selectWrap}>
                <select
                  value={category}
                  onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
                  style={s.select}
                  disabled={categoriesLoading}
                >
                  {categoryOptions.map((opt) => (
                    <option key={`${opt.value}-${opt.label}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>

              <div style={s.selectWrap}>
                <select
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
                  style={s.select}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} style={s.clearBtn}>
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>
        </SectionShell>

        {/* Error Message */}
        {errorMessage && (
          <div style={s.errorBox}>
            <AlertIcon />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <span style={s.loadingText}>جاري التحميل...</span>
          </div>
        ) : normalizedProducts.length === 0 ? (
          <SectionShell style={s.emptyState}>
            <EmptyIcon />
            <h2 style={s.emptyTitle}>لا توجد نتائج</h2>
            <p style={s.emptyText}>جرب تعديل الفلاتر أو البحث بكلمات مختلفة</p>
            <button onClick={clearFilters} style={s.emptyBtn}>
              مسح الفلاتر
            </button>
          </SectionShell>
        ) : (
          <>
            <div style={s.resultsHeader}>
              <span style={s.resultsCount}>{pagination.total} نتيجة</span>
            </div>

            <div style={s.productsGrid}>
              {normalizedProducts.map((product) => (
                <ProductCard
                  key={product.id || product.slug || product.name}
                  product={product}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={s.pagination}>
            <button
              onClick={() => updateFilters({ page: Math.max(page - 1, 1) })}
              disabled={page <= 1}
              style={{ ...s.pageBtn, ...(page <= 1 ? s.pageBtnDisabled : {}) }}
            >
              السابق
            </button>

            <span style={s.pageInfo}>
              {pagination.page} من {pagination.pages}
            </span>

            <button
              onClick={() => updateFilters({ page: Math.min(page + 1, pagination.pages) })}
              disabled={page >= pagination.pages}
              style={{ ...s.pageBtn, ...(page >= pagination.pages ? s.pageBtnDisabled : {}) }}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 5v4M9 11.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="8" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M18 18h12M18 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const s = {
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: UI.spacing.xl
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  pageTitle: {
    margin: 0,
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 700,
    color: UI.colors.text
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: UI.colors.textMuted
  },
  filtersGrid: {
    display: "flex",
    flexDirection: "column",
    gap: UI.spacing.md
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    padding: "6px 6px 6px 14px",
    color: UI.colors.textMuted
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: UI.colors.text,
    fontSize: "14px",
    padding: "10px 0"
  },
  searchBtn: {
    height: "40px",
    padding: "0 16px",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    border: "none",
    borderRadius: UI.radius.sm,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer"
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  selectWrap: {
    position: "relative",
    flex: "1 1 140px"
  },
  select: {
    width: "100%",
    height: "44px",
    padding: "0 36px 0 14px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    color: UI.colors.text,
    fontSize: "14px",
    appearance: "none",
    cursor: "pointer"
  },
  clearBtn: {
    height: "44px",
    padding: "0 16px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    color: UI.colors.textSecondary,
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer"
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    background: UI.colors.errorBg,
    border: `1px solid ${UI.colors.errorBorder}`,
    borderRadius: UI.radius.md,
    color: UI.colors.error,
    fontSize: "14px"
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "64px 24px"
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: `3px solid ${UI.colors.border}`,
    borderTopColor: UI.colors.accent,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  loadingText: {
    fontSize: "14px",
    color: UI.colors.textMuted
  },
  emptyState: {
    alignItems: "center",
    textAlign: "center",
    color: UI.colors.textMuted
  },
  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: UI.colors.text
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: UI.colors.textMuted
  },
  emptyBtn: {
    height: "44px",
    padding: "0 20px",
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    border: "none",
    borderRadius: UI.radius.md,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer"
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  resultsCount: {
    fontSize: "14px",
    color: UI.colors.textSecondary
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: UI.spacing.md
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px"
  },
  pageBtn: {
    height: "40px",
    padding: "0 16px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    color: UI.colors.text,
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer"
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  pageInfo: {
    fontSize: "14px",
    color: UI.colors.textSecondary
  }
};
