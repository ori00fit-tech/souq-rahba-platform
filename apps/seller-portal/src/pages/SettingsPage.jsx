export default function SettingsPage() {
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
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div style={{ color: "#6b7280", marginBottom: "18px" }}>
        Update your seller profile and store info
      </div>

      <form style={{ display: "grid", gap: "12px", maxWidth: "520px" }}>
        <input
          type="text"
          placeholder="Store name"
          style={{ padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db" }}
        />
        <input
          type="email"
          placeholder="Email"
          style={{ padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db" }}
        />
        <input
          type="text"
          placeholder="Phone"
          style={{ padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db" }}
        />
        <textarea
          placeholder="Store description"
          rows="5"
          style={{ padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db" }}
        />
        <button
          type="button"
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#111827",
            color: "#ffffff",
            fontWeight: "700"
          }}
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
