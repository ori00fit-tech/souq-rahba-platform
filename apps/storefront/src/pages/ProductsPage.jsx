import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiGet("/catalog/products")
      .then((res) => {
        if (res.ok) setProducts(res.data);
      })
      .catch(console.error);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const text = `${p.title_ar || ""} ${p.slug || ""} ${p.category_id || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [products, query]);

  return (
    <section className="container section-space">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "12px" }}>المنتجات</h1>

        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #d6d1c4",
            background: "#fff",
            fontSize: "16px",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        {filteredProducts.map((p) => (
          <article
            key={p.id}
            style={{
              background: "#fff",
              border: "1px solid #e7e1d4",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <Link
              to={`/products/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  height: "180px",
                  background: "#f1eee8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#777",
                  overflow: "hidden",
                }}
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title_ar}
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
            </Link>

            <div style={{ padding: "14px" }}>
              <Link
                to={`/products/${p.id}`}
                style={{
                  textDecoration: "none",
                  color: "#1f3b73",
                  fontSize: "18px",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "8px",
                  lineHeight: 1.4,
                }}
              >
                {p.title_ar}
              </Link>

              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                {p.category_id || "غير مصنف"}
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: "8px",
                }}
              >
                {p.price_mad} MAD
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "14px",
                }}
              >
                المخزون: {p.stock} · الحالة: {p.status}
              </div>

              <Link
                to={`/products/${p.id}`}
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "#1f3b73",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                عرض المنتج
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
