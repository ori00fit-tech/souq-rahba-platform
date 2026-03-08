const products = [
  { id: 1, name: "Fresh Sardines", price: "28 MAD", stock: 120, status: "Active" },
  { id: 2, name: "Fishing Net", price: "350 MAD", stock: 12, status: "Active" },
  { id: 3, name: "Ice Box", price: "490 MAD", stock: 5, status: "Low stock" }
];

export default function ProductsPage() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <div style={{ color: "#6b7280", marginTop: "4px" }}>
            Manage your active catalog
          </div>
        </div>
        <button
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: "700"
          }}
        >
          Add Product
        </button>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{product.name}</h3>
                <div style={{ color: "#6b7280" }}>Stock: {product.stock}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", fontSize: "18px" }}>{product.price}</div>
                <div style={{ color: product.status === "Low stock" ? "#dc2626" : "#16a34a" }}>
                  {product.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
