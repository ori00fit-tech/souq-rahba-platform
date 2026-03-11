export default function PromoHero() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #0ea5e9 100%)",
        color: "#fff",
        borderRadius: "28px",
        padding: "28px",
        display: "grid",
        gap: "18px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.24)"
      }}
    >
      <div style={{ display: "grid", gap: "10px", maxWidth: "640px" }}>
        <div
          style={{
            width: "fit-content",
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.16)",
            fontWeight: "700",
            fontSize: "13px"
          }}
        >
          RAHBA • Online Marketplace
        </div>

        <h1 style={{ margin: 0, fontSize: "36px", lineHeight: 1.1 }}>
          Discover products from trusted sellers across Morocco
        </h1>

        <p style={{ margin: 0, color: "rgba(255,255,255,0.88)", fontSize: "16px", lineHeight: 1.6 }}>
          Shop electronics, fashion, home goods, tools and more through one modern marketplace experience.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          href="/products"
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "#fff",
            color: "#0f172a",
            textDecoration: "none",
            fontWeight: "800"
          }}
        >
          Browse Marketplace
        </a>

        <a
          href="https://seller.rahba.site"
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.14)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "800",
            border: "1px solid rgba(255,255,255,0.22)"
          }}
        >
          Start Selling
        </a>
      </div>
    </section>
  );
}
