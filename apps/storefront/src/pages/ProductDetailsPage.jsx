import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, currentUser, authLoading } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet(`/catalog/products/${slug}`);
        if (res.ok) {
          setProduct(res.data);
        } else {
          setMessage("تعذر تحميل المنتج");
        }
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  function normalizeProduct(p) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title_ar || "",
      price: p.price_mad || 0,
      seller_id: p.seller_id || null,
      seller: p.seller_id || "Souq Rahba",
      city: "",
      rating: 0,
      reviews: 0,
      stock: p.stock || 0,
      badge: p.status || "",
      description: p.description_ar || "",
      image_url: p.image_url || ""
    };
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function handleGoToCheckout() {
    if (!product) return;
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  async function handleBuyNow() {
    if (!product) return;

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

      setBuying(true);
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
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <section className="container section-space">
        <p>جاري تحميل المنتج...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container section-space">
        <p>المنتج غير موجود</p>
      </section>
    );
  }

  return (
    <section className="container section-space">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          alignItems: "start"
        }}
      >
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title_ar}
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                minHeight: "320px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "grid",
                placeItems: "center",
                color: "#94a3b8"
              }}
            >
              No image
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <h1 style={{ marginBottom: "8px" }}>{product.title_ar}</h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              {product.description_ar || "بدون وصف"}
            </p>
          </div>

          <div style={{ fontSize: "28px", fontWeight: "700" }}>
            {product.price_mad} MAD
          </div>

          <div style={{ color: "#64748b" }}>
            المخزون: {product.stock}
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

          <div style={{ display: "grid", gap: "10px" }}>
            <button
              onClick={handleAddToCart}
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
              onClick={handleGoToCheckout}
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
              onClick={handleBuyNow}
              disabled={buying || product.stock <= 0}
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: product.stock <= 0 ? "#94a3b8" : "#111827",
                color: "#fff",
                fontWeight: "700",
                cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                opacity: buying ? 0.7 : 1
              }}
            >
              {buying
                ? "جاري الطلب..."
                : product.stock <= 0
                ? "غير متوفر"
                : "Buy Now مباشر"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
