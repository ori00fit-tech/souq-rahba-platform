import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@rahba/shared";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSellers() {
    try {
      const res = await apiGet("/admin/sellers");
      setSellers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSellers();
  }, []);

  async function updateSeller(id, kyc_status, verified) {
    try {
      const res = await apiPatch(`/admin/sellers/${id}/status`, {
        kyc_status,
        verified
      });

      if (res.ok) {
        setSellers((prev) =>
          prev.map((seller) =>
            seller.id === id
              ? { ...seller, kyc_status, verified: verified ? 1 : 0 }
              : seller
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update seller");
    }
  }

  if (loading) return <div style={{ padding: "24px" }}>Loading sellers...</div>;

  return (
    <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
      <h1 style={{ margin: 0 }}>Seller Moderation</h1>

      {sellers.map((seller) => (
        <div
          key={seller.id}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "16px",
            display: "grid",
            gap: "10px"
          }}
        >
          <div><strong>{seller.display_name}</strong></div>
          <div>Email: {seller.email || "-"}</div>
          <div>Slug: {seller.slug}</div>
          <div>City: {seller.city || "-"}</div>
          <div>KYC: {seller.kyc_status}</div>
          <div>Verified: {seller.verified ? "Yes" : "No"}</div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => updateSeller(seller.id, "approved", true)}
              style={btnApprove}
            >
              Approve
            </button>

            <button
              onClick={() => updateSeller(seller.id, "rejected", false)}
              style={btnReject}
            >
              Reject
            </button>

            <button
              onClick={() => updateSeller(seller.id, "pending", false)}
              style={btnPending}
            >
              Reset Pending
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const btnApprove = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#16a34a",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const btnReject = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#dc2626",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};

const btnPending = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#475569",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer"
};
