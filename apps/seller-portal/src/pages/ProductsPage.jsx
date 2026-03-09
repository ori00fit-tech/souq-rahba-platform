import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiDelete, apiGet } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

export default function ProductsPage() {
  const { currentSeller, authLoading } = useSellerAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        if (!currentSeller) return;

        setLoading(true);
        setErrorText("");

        const res = await apiGet(`/catalog/products?seller_id=${currentSeller.id}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setErrorText("Could not load products.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadProducts();
    }
  }, [currentSeller, authLoading]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await apiDelete(`/catalog/products/${id}`);
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  }

  if (loading || authLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Your Products</h2>

        <Link
          to="/add-product"
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#ea580c",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "700"
          }}
        >
          + Add Product
        </Link>
      </div>

      {errorText ? (
        <div style={{ background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa", borderRadius: "12px", padding: "12px" }}>
          {errorText}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "20px" }}>
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

            <Link
              to={`/edit-product/${p.id}`}
              style={{
                marginTop: "6px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#111827",
                color: "#fff",
                textDecoration: "none",
                textAlign: "center",
                fontWeight: "700"
              }}
            >
              Edit
            </Link>

            <button
              onClick={() => deleteProduct(p.id)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: "#dc2626",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
