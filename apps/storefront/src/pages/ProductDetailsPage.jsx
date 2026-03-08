import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { addToCart } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiGet(`/catalog/products/${slug}`)
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setProduct(res.data);
          setError("");
        } else {
          setError("تعذر تحميل المنتج");
        }
      })
      .catch(() => {
        if (active) setError("تعذر تحميل المنتج");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="container section-space">
        <div className="panel-card">
          <p>جارٍ تحميل المنتج...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container section-space">
        <div className="panel-card">
          <h2>المنتج غير موجود</h2>
          <p>{error || "لم يتم العثور على المنتج المطلوب."}</p>
        </div>
      </section>
    );
  }

  const cartProduct = {
    id: product.id,
    name: product.title_ar,
    price: product.price_mad,
    seller: product.seller_id || "Souq Rahba",
    city: "",
    rating: 0,
    reviews: 0,
    cod: true,
    stock: product.stock,
    badge: product.status,
    description: product.description_ar || "",
  };

  return (
    <section className="container section-space">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7e1d4",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              height: "320px",
              background: "#f1eee8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title_ar}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span>صورة المنتج</span>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e7e1d4",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ marginBottom: "12px", lineHeight: 1.3 }}>
            {product.title_ar}
          </h1>

          <div style={{ color: "#666", marginBottom: "10px" }}>
            الفئة: {product.category_id || "غير مصنفة"}
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: "800",
              marginBottom: "14px",
              color: "#111",
            }}
          >
            {product.price_mad} MAD
          </div>

          <div style={{ color: "#666", marginBottom: "16px" }}>
            المخزون: {product.stock} · الحالة: {product.status}
          </div>

          <p style={{ lineHeight: 1.8, marginBottom: "20px" }}>
            {product.description_ar || "لا يوجد وصف متاح حاليًا."}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => addToCart(cartProduct)}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                background: "#1f3b73",
                color: "#fff",
                border: "none",
                fontWeight: 700,
              }}
            >
              أضف إلى السلة
            </button>

            <button
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                background: "#fff",
                color: "#111",
                border: "1px solid #d6d1c4",
                fontWeight: 700,
              }}
            >
              اشتر الآن
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}	

