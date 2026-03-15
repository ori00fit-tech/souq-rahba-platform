import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر: من الأقل إلى الأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى إلى الأقل" },
  { value: "featured", label: "المنتجات المميزة" },
  { value: "stock_desc", label: "الأكثر توفراً" },
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
  { value: "food", label: "مواد غذائية" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, currentUser, authLoading } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState("");
  const [message, setMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

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
        params.set("limit", "12");

        const result = await apiGet(`/catalog/products?${params.toString()}`);
        setProducts(result.data?.items || []);
        setPagination(
          result.data?.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            pages: 1,
          }
        );
      } catch (err) {
        console.error(err);
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

  function normalizeProduct(product) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.title_ar || "",
      price: product.price_mad || 0,
      seller_id: product.seller_id || null,
      seller: product.seller_id || "Souq Rahba",
      city: "",
      rating: 0,
      reviews: 0,
      stock: product.stock || 0,
      badge: product.status || "",
      description: product.description_ar || "",
      image_url: product.image_url || ""
    };
  }

  function handleAddToCart(product) {
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  async function handleBuyNow(product) {
    try {
      if (authLoading) {
        setMessage("جاري التحقق من الجلسة...");
        return;
      }

      if (!currentUser) {
        setMessage("يجب تسجيل الدخول أولاً قبل إنشاء الطلب");
        navigate("/auth");
        return;
      }

      if (currentUser.role !== "buyer") {
        setMessage("فقط حسابات المشترين يمكنها إنشاء الطلبات");
        return;
      }

      setBuyingId(product.id);
      setMessage("");

      const result = await apiPost("/commerce/orders", {
        buyer_user_id: currentUser.id,
        seller_id: product.seller_id,
        payment_method: "cash_on_delivery",
        items: [
          {
            product_id: product.id,
            quantity: 1,
            unit_price_mad: product.price_mad
          }
        ]
      });

      if (result.ok) {
        setMessage(`تم إنشاء الطلب بنجاح. رقم الطلب: ${result.data.id}`);
        setTimeout(() => {
          navigate("/my-orders");
        }, 1000);
      } else {
        setMessage("فشل إنشاء الطلب");
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setBuyingId("");
    }
  }

  function handleGoToCheckout(product) {
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  const hasFilters = useMemo(() => {
    return Boolean(q || category || sort !== "newest");
  }, [q, category, sort]);

  if (loading) {
    return (
      <section className="container section-space">
        <p>جاري تحميل المنتجات...</p>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={{ display: "grid", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <h1>المنتجات</h1>
          <p style={{ color: "#64748b" }}>
            ابحث، صفِّ، ورتّب المنتجات داخل السوق
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "14px",
            display: "grid",
            gap: "12px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr auto",
              gap: "10px"
            }}
          >
            <input
              value={q}
              onChange={(e) => updateFilters({ q: e.target.value, page: 1 })}
              placeholder="ابحث عن منتج..."
              style={inputStyle}
            />

            <select
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
              style={inputStyle}
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
              style={inputStyle}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchParams({});
                setMessage("");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                background: "#fff",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              مسح
            </button>
          </div>

          <div style={{ color: "#64748b", fontSize: "14px", textAlign: "right" }}>
            {pagination.total} منتج
            {hasFilters ? " مطابق للبحث الحالي" : " متوفر داخل السوق"}
          </div>
        </div>

        {message ? (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#fff"
            }}
          >
            {message}
          </div>
        ) : null}

        {products.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              textAlign: "center"
            }}
          >
            لا توجد منتجات مطابقة حاليًا.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px"
            }}
          >
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "grid",
                  gap: "12px"
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title_ar}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "10px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      display: "grid",
                      placeItems: "center",
                      color: "#94a3b8"
                    }}
                  >
                    No image
                  </div>
                )}

                <h3 style={{ margin: 0 }}>{product.title_ar}</h3>

                <p style={{ margin: 0, color: "#64748b" }}>
                  {product.description_ar || "بدون وصف"}
                </p>

                <div style={{ fontWeight: "700" }}>
                  {product.price_mad} MAD
                </div>

                <div style={{ color: "#64748b" }}>
                  المخزون: {product.stock}
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      color: "#111827",
                      fontWeight: "700",
                      cursor: product.stock <= 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    {product.stock <= 0 ? "غير متوفر" : "أضف إلى السلة"}
                  </button>

                  <button
                    onClick={() => handleGoToCheckout(product)}
                    disabled={product.stock <= 0}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#1f3b73",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: product.stock <= 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    اشتر الآن عبر Checkout
                  </button>

                  <button
                    onClick={() => handleBuyNow(product)}
                    disabled={buyingId === product.id || product.stock <= 0}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "none",
                      background: product.stock <= 0 ? "#94a3b8" : "#111827",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                      opacity: buyingId === product.id ? 0.7 : 1
                    }}
                  >
                    {buyingId === product.id
                      ? "جاري الطلب..."
                      : product.stock <= 0
                      ? "غير متوفر"
                      : "Buy Now مباشر"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination.pages > 1 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => updateFilters({ page: Math.max(page - 1, 1) })}
              disabled={page <= 1}
              style={pagerButtonStyle(page <= 1)}
            >
              السابق
            </button>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                fontWeight: "700"
              }}
            >
              صفحة {pagination.page} من {pagination.pages}
            </div>

            <button
              onClick={() => updateFilters({ page: Math.min(page + 1, pagination.pages) })}
              disabled={page >= pagination.pages}
              style={pagerButtonStyle(page >= pagination.pages)}
            >
              التالي
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#fff",
  fontFamily: "inherit",
  fontSize: "14px",
};

function pagerButtonStyle(disabled) {
  return {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
