import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useIsMobile() {
  const getValue = () => (typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [isMobile, setIsMobile] = useState(getValue());

  useEffect(() => {
    const onResize = () => setIsMobile(getValue());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

function cardStyle(isMobile) {
  return {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: isMobile ? "14px" : "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
  };
}

function getStatusStyle(status) {
  if (status === "Active") {
    return {
      background: "#ecfdf5",
      color: "#166534"
    };
  }

  if (status === "Low stock") {
    return {
      background: "#fff7ed",
      color: "#9a3412"
    };
  }

  if (status === "Out of stock") {
    return {
      background: "#fef2f2",
      color: "#991b1b"
    };
  }

  return {
    background: "#f8fafc",
    color: "#475569"
  };
}

function normalizeProduct(product, index) {
  return {
    id: product?.id ?? index + 1,
    name: product?.title ?? product?.name ?? "Untitled Product",
    sku: product?.sku ?? `SKU-${index + 1}`,
    price:
      product?.price_mad != null
        ? `${product.price_mad} MAD`
        : product?.price != null
          ? `${product.price} MAD`
          : "0 MAD",
    stock: product?.stock_quantity ?? product?.stock ?? 0,
    status:
      product?.status === "active"
        ? "Active"
        : product?.status === "draft"
          ? "Draft"
          : product?.status === "out_of_stock"
            ? "Out of stock"
            : (product?.stock_quantity ?? product?.stock ?? 0) <= 5
              ? "Low stock"
              : "Active",
    image: product?.image ?? "📦"
  };
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorText("");

        const res = await fetch("https://souq-rahba-api.ori00fit.workers.dev/catalog/products");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const items = Array.isArray(data?.data) ? data.data : [];
        setProducts(items.map(normalizeProduct));
      } catch (err) {
        console.error("Failed to load products", err);
        setErrorText("Could not load products from API. Showing demo data.");

        setProducts([
          {
            id: 1,
            name: "Fresh Sardines Box",
            sku: "FSB-001",
            price: "28 MAD",
            stock: 120,
            status: "Active",
            image: "🐟"
          },
          {
            id: 2,
            name: "Fishing Net Premium",
            sku: "FNP-204",
            price: "350 MAD",
            stock: 12,
            status: "Active",
            image: "🕸️"
          },
          {
            id: 3,
            name: "Ice Box 42L",
            sku: "IBX-420",
            price: "490 MAD",
            stock: 5,
            status: "Low stock",
            image: "🧊"
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <section style={cardStyle(isMobile)}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Products</h2>
            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Manage your catalog
            </div>
          </div>

          <button
            onClick={() => navigate("/add-product")}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#ea580c",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            + Add Product
          </button>
        </div>
      </section>

      {errorText ? (
        <div
          style={{
            ...cardStyle(isMobile),
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          {errorText}
        </div>
      ) : null}

      {loading ? (
        <div style={cardStyle(isMobile)}>
          <div style={{ color: "#64748b", fontWeight: 600 }}>Loading products...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {products.map((p) => (
            <div key={p.id} style={cardStyle(isMobile)}>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    background: "#fff7ed",
                    flexShrink: 0
                  }}
                >
                  {p.image}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#0f172a",
                      wordBreak: "break-word"
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "4px"
                    }}
                  >
                    SKU: {p.sku}
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontWeight: 700
                    }}
                  >
                    {p.price}
                  </div>
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    ...getStatusStyle(p.status)
                  }}
                >
                  {p.status}
                </div>
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap"
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: p.stock < 6 ? "#c2410c" : "#0f172a",
                    fontWeight: 700
                  }}
                >
                  Stock: {p.stock}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>

                  <button
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 ? (
            <div style={cardStyle(isMobile)}>
              <div style={{ color: "#64748b" }}>No products found.</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
