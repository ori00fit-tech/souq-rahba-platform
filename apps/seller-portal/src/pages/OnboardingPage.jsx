import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { currentSeller, authLoading } = useSellerAuth();

  const [form, setForm] = useState({
    display_name: "",
    slug: "",
    city: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!authLoading && currentSeller?.id) {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await apiPost("/marketplace/onboarding", form);

      if (res.ok) {
        setMessage("Seller profile created successfully");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to create seller profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "560px", margin: "40px auto", display: "grid", gap: "20px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "24px"
        }}
      >
        <h1 style={{ marginTop: 0 }}>Seller Onboarding</h1>
        <p style={{ color: "#64748b" }}>
          Create your seller profile to start managing products and orders.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <input
            name="display_name"
            placeholder="Store name"
            value={form.display_name}
            onChange={handleChange}
            style={input}
          />

          <input
            name="slug"
            placeholder="Store slug (optional)"
            value={form.slug}
            onChange={handleChange}
            style={input}
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            style={input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#ea580c",
              color: "#fff",
              fontWeight: "700"
            }}
          >
            {loading ? "Creating..." : "Create Seller Profile"}
          </button>
        </form>

        {message ? <p style={{ marginTop: "14px" }}>{message}</p> : null}
      </div>
    </div>
  );
}

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "14px"
};
