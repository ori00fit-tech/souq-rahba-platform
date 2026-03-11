const items = [
  {
    title: "Verified Sellers",
    text: "Buy from approved marketplace sellers with moderation and account review."
  },
  {
    title: "Secure Checkout",
    text: "A clean ordering flow with protected account access and order tracking."
  },
  {
    title: "Growing Marketplace",
    text: "A single destination for products, stores and categories across Morocco."
  }
];

export default function TrustSection() {
  return (
    <section style={{ display: "grid", gap: "16px" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "24px" }}>Why RAHBA?</h2>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>
          Built to connect buyers and trusted sellers in one marketplace
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        {items.map((item) => (
          <div
            key={item.title}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "20px",
              display: "grid",
              gap: "10px"
            }}
          >
            <div style={{ fontWeight: "800", fontSize: "17px" }}>{item.title}</div>
            <div style={{ color: "#64748b", lineHeight: 1.6 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
