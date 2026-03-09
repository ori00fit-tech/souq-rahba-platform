import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function ProductsPage() {
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

  async function handleBuyNow(product) {
    try {
      setBuyingId(product.id);
      setMessage("");

      const result = await apiPost("/commerce/orders", {
        buyer_user_id: "u3",
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

  if (loading) {
    return <section className="container section-space"><p>جاري تحميل المنتجات...</p></section>;
  }

  return (
    <section className="container section-space">
      <div style={{ display: "grid", gap: "16px" }}>
        <div>
          <h1>المنتجات</h1>
          <p style={{ color: "#64748b" }}>تصفح المنتجات واطلب مباشرة</p>
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
                {buyingId === product.id ? "جاري الطلب..." : product.stock <= 0 ? "غير متوفر" : "Buy Now"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
