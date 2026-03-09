import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { addToCart, currentUser, authLoading } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await apiGet("/catalog/products");
        setProducts(result.data || []);
      } catch (err) {
        console.error(err);
        setMessage("تعذر تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

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

  if (loading) {
    return (
      <section className="container section-space">
        <p>جاري تحميل المنتجات...</p>
      </section>
    );
  }

  return (
    <section className="container section-space">
      <div style={{ display: "grid", gap: "16px" }}>
        <div>
          <h1>المنتجات</h1>
          <p style={{ color: "#64748b" }}>تصفح المنتجات واطلب مباشرة أو أضفها إلى السلة</p>
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
      </div>
    </section>
  );
}
