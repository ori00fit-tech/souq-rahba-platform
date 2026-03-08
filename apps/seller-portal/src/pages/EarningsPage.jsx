const cards = [
  { title: "Total Revenue", value: "24,500 MAD" },
  { title: "Pending Payout", value: "6,200 MAD" },
  { title: "Completed Payouts", value: "18,300 MAD" }
];

export default function EarningsPage() {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Earnings</h2>
        <div style={{ color: "#6b7280" }}>Track your revenue and payouts</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px"
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ color: "#6b7280", fontSize: "13px" }}>{card.title}</div>
            <div style={{ marginTop: "8px", fontSize: "26px", fontWeight: "700" }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
