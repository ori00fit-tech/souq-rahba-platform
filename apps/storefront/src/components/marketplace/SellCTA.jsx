export default function SellCTA() {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "24px",
        padding: "24px",
        display: "grid",
        gap: "14px"
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "24px" }}>Sell on RAHBA</h2>
        <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.6 }}>
          Create your seller profile, add products, manage orders and grow your store on the marketplace.
        </p>
      </div>

      <div>
        <a
          href="https://seller.rahba.site"
          style={{
            display: "inline-block",
            padding: "14px 18px",
            borderRadius: "14px",
            background: "#111827",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "800"
          }}
        >
          Open Seller Portal
        </a>
      </div>
    </section>
  );
}
