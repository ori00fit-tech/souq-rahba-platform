export default function PromoHero() {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, #16356b 0%, #1d4ed8 52%, #0ea5e9 100%)",
        color: "#fff",
        borderRadius: "28px",
        padding: "22px 18px",
        display: "grid",
        gap: "16px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 28%)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: "14px"
        }}
      >
        <div
          style={{
            width: "fit-content",
            maxWidth: "100%",
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.16)",
            fontWeight: "800",
            fontSize: "13px",
            backdropFilter: "blur(6px)"
          }}
        >
          RAHBA • Online Marketplace
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 7vw, 52px)",
              lineHeight: 1.08,
              fontWeight: "900",
              letterSpacing: "-0.02em"
            }}
          >
            Discover products from trusted sellers across Morocco
          </h1>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.88)",
              fontSize: "clamp(15px, 3.7vw, 18px)",
              lineHeight: 1.65,
              maxWidth: "760px"
            }}
          >
            Shop electronics, fashion, home goods, tools and more through one modern marketplace experience.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <a
            href="/products"
            style={{
              textDecoration: "none",
              padding: "13px 18px",
              borderRadius: "16px",
              background: "#ffffff",
              color: "#16356b",
              fontWeight: "900",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.14)"
            }}
          >
            Browse Marketplace
          </a>

          <a
            href="https://seller.rahba.site"
            style={{
              textDecoration: "none",
              padding: "13px 18px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.14)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.18)",
              fontWeight: "900",
              backdropFilter: "blur(6px)"
            }}
          >
            Start Selling
          </a>
        </div>
      </div>
    </section>
  );
}
