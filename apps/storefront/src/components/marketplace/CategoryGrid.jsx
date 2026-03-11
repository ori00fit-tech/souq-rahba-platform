const categories = [
  { name: "Electronics", icon: "📱" },
  { name: "Fashion", icon: "👕" },
  { name: "Home", icon: "🏠" },
  { name: "Beauty", icon: "💄" },
  { name: "Sports", icon: "🏃" },
  { name: "Tools", icon: "🛠️" },
  { name: "Automotive", icon: "🚗" },
  { name: "Garden", icon: "🌿" }
];

export default function CategoryGrid() {
  return (
    <section style={{ display: "grid", gap: "16px" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "24px" }}>Browse Categories</h2>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>
          Discover products across popular marketplace categories
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px"
        }}
      >
        {categories.map((category) => (
          <div
            key={category.name}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "18px",
              display: "grid",
              gap: "10px",
              minHeight: "120px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)"
            }}
          >
            <div style={{ fontSize: "28px" }}>{category.icon}</div>
            <div style={{ fontWeight: "700", fontSize: "15px" }}>{category.name}</div>
            <div style={{ color: "#64748b", fontSize: "13px" }}>Explore category</div>
          </div>
        ))}
      </div>
    </section>
  );
}
