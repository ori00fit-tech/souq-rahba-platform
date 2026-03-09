import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";

export default function LoginPage() {
  const { currentSeller, loginSeller, authLoading } = useSellerAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && currentSeller) {
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

      await loginSeller(form.email, form.password);
      setMessage("Logged in successfully");
    } catch (err) {
      console.error(err);
      setMessage("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "460px", margin: "40px auto", display: "grid", gap: "20px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "24px"
        }}
      >
        <h1 style={{ marginTop: 0 }}>Seller Login</h1>
        <p style={{ color: "#64748b" }}>Login to manage your store</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={input}
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
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
            {loading ? "Logging in..." : "Login"}
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
