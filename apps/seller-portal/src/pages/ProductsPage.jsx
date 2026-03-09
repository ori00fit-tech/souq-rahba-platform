import { useEffect, useState } from "react";

const API = "https://souq-rahba-api.ori00fit.workers.dev";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorText("");

        const res = await fetch(`${API}/catalog/products`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
        setErrorText("Could not load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h2>Your Products</h2>

      {errorText ? (
        <div
          style={{
            background: "#fff7ed",
            color: "#9a3412",
            border: "1px solid #fed7aa",
            borderRadius: "12px",
            padding: "12px"
          }}
        >
          {errorText}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
          gap: "20px"
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              display: "grid",
              gap: "10px"
            }}
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.title_ar}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  display: "grid",
                  placeItems: "center",
                  color: "#94a3b8",
                  fontWeight: "700"
                }}
              >
                No image
              </div>
            )}

            <h3 style={{ margin: 0 }}>{p.title_ar}</h3>

            <p style={{ margin: 0 }}>Price: {p.price_mad} MAD</p>

            <p style={{ margin: 0 }}>Stock: {p.stock}</p>

            <p style={{ margin: 0, color: "#64748b" }}>Slug: {p.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
