import { useEffect, useState } from "react";

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

const products = [
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
];

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

  return {
    background: "#fef2f2",
    color: "#991b1b"
  };
}

export default function ProductsPage() {
  const isMobile = useIsMobile();

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
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#ea580c",
              color: "#fff",
              fontWeight: 700
            }}
          >
            + Add Product
          </button>
        </div>
      </section>

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
                  background: "#fff7ed"
                }}
              >
                {p.image}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{p.name}</div>

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
                alignItems: "center"
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

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#fff"
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
                    color: "#fff"
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
