const productStats = [
  { label: "Total Products", value: "18" },
  { label: "Active", value: "14" },
  { label: "Low Stock", value: "3" },
  { label: "Draft", value: "1" }
];

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
  },
  {
    id: 4,
    name: "Shrimp Storage Crate",
    sku: "SSC-118",
    price: "220 MAD",
    stock: 0,
    status: "Out of stock",
    image: "🦐"
  },
  {
    id: 5,
    name: "Boat Safety Lamp",
    sku: "BSL-992",
    price: "160 MAD",
    stock: 8,
    status: "Draft",
    image: "💡"
  }
];

function cardStyle() {
  return {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.06)"
  };
}

function getStatusStyle(status) {
  if (status === "Active") {
    return {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #bbf7d0"
    };
  }

  if (status === "Low stock") {
    return {
      background: "#fff7ed",
      color: "#9a3412",
      border: "1px solid #fed7aa"
    };
  }

  if (status === "Draft") {
    return {
      background: "#f8fafc",
      color: "#475569",
      border: "1px solid #cbd5e1"
    };
  }

  return {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca"
  };
}

function getStockColor(stock) {
  if (stock === 0) return "#991b1b";
  if (stock <= 5) return "#c2410c";
  return "#0f172a";
}

export default function ProductsPage() {
  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <section
        style={{
          ...cardStyle(),
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(255,255,255,1) 45%, rgba(249,250,251,1) 100%)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
              Catalog Management
            </div>
            <h2 style={{ margin: "8px 0 8px", fontSize: "28px", color: "#0f172a" }}>
              Products
            </h2>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
              Manage your listings, monitor stock and keep your catalog updated.
            </p>
          </div>

          <button
            style={{
              padding: "13px 18px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              color: "#ffffff",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(234, 88, 12, 0.22)"
            }}
          >
            + Add Product
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px"
        }}
      >
        {productStats.map((item) => (
          <div key={item.label} style={cardStyle()}>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: "8px"
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section style={cardStyle()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Your Listings</h3>
            <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Search, update and review your products
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid #dbe2ea",
                minWidth: "220px",
                outline: "none",
                background: "#f8fafc"
              }}
            />
            <button
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Filter
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "16px",
                background: "#fcfcfd"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px minmax(0, 1.4fr) minmax(120px, 0.7fr) minmax(100px, 0.7fr) minmax(120px, 0.8fr) auto",
                  gap: "14px",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                    border: "1px solid #fed7aa"
                  }}
                >
                  {product.image}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#0f172a",
                      fontSize: "17px"
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      color: "#64748b"
                    }}
                  >
                    SKU: {product.sku}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
                    PRICE
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontWeight: 800,
                      color: "#0f172a"
                    }}
                  >
                    {product.price}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
                    STOCK
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontWeight: 800,
                      color: getStockColor(product.stock)
                    }}
                  >
                    {product.stock}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
                    STATUS
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "7px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      ...getStatusStyle(product.status)
                    }}
                  >
                    {product.status}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end"
                  }}
                >
                  <button
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#111827",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
