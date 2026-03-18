import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    confirmed_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiGet("/commerce/stats");
        if (res.ok) {
          setStats({
            total_orders: Number(res.data?.total_orders || 0),
            total_revenue: Number(res.data?.total_revenue || 0),
            pending_orders: Number(res.data?.pending_orders || 0),
            confirmed_orders: Number(res.data?.confirmed_orders || 0)
          });
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-shell">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>لوحة التحكم</h1>
        <p>نظرة سريعة على أداء متجرك داخل رحبة</p>
      </div>

      <div style={styles.grid}>
        <div style={{ ...styles.card, borderRight: "4px solid #10b981" }}>
          <span style={styles.label}>إجمالي المبيعات المستلمة</span>
          <h2 style={styles.value}>{stats.total_revenue} MAD</h2>
        </div>

        <div style={{ ...styles.card, borderRight: "4px solid #3b82f6" }}>
          <span style={styles.label}>إجمالي الطلبات</span>
          <h2 style={styles.value}>{stats.total_orders}</h2>
        </div>

        <div style={{ ...styles.card, borderRight: "4px solid #f59e0b" }}>
          <span style={styles.label}>طلبات قيد الانتظار</span>
          <h2 style={{ ...styles.value, color: "#d97706" }}>{stats.pending_orders}</h2>
        </div>

        <div style={{ ...styles.card, borderRight: "4px solid #8b5cf6" }}>
          <span style={styles.label}>طلبات تم تأكيدها</span>
          <h2 style={styles.value}>{stats.confirmed_orders}</h2>
        </div>
      </div>
    </section>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700"
  },
  value: {
    fontSize: "28px",
    fontWeight: "900",
    margin: 0,
    color: "#0f172a"
  }
};
