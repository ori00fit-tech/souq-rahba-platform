import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@rahba/shared";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("en-US")} MAD`;
}

export default function EarningsPage() {
  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setMessage("");

        const sellerRes = await apiGet("/marketplace/me");
        if (!sellerRes?.ok || !sellerRes?.data?.id) {
          setMessage("تعذر تحديد المتجر الحالي");
          return;
        }

        const currentSeller = sellerRes.data;
        setSeller(currentSeller);

        const ordersRes = await apiGet(`/orders?seller_id=${encodeURIComponent(currentSeller.id)}`);

        if (!ordersRes?.ok) {
          setMessage(ordersRes?.message || "تعذر تحميل أرباح المتجر");
          return;
        }

        setOrders(Array.isArray(ordersRes?.data) ? ordersRes.data : []);
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "حدث خطأ أثناء تحميل الأرباح");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_mad || 0),
      0
    );

    const pendingRevenue = orders
      .filter(
        (order) =>
          order.order_status === "pending" ||
          order.payment_status === "pending"
      )
      .reduce((sum, order) => sum + Number(order.total_mad || 0), 0);

    const completedRevenue = orders
      .filter(
        (order) =>
          order.order_status === "completed" ||
          order.payment_status === "paid"
      )
      .reduce((sum, order) => sum + Number(order.total_mad || 0), 0);

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingRevenue,
      completedRevenue
    };
  }, [orders]);

  if (loading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header earnings-header">
          <div>
            <h1>الأرباح</h1>
            <p>جاري تحميل بيانات الأرباح...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header earnings-header">
        <div>
          <h1>الأرباح</h1>
          <p>
            تتبع الإيرادات والطلبات الخاصة بمتجرك
            {seller?.display_name ? ` — ${seller.display_name}` : ""}
          </p>
        </div>
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      <div className="earnings-stats-grid">
        <div className="earnings-stat-card">
          <div className="ui-badge ui-badge--info">إجمالي الإيرادات</div>
          <div className="earnings-stat-value">{formatMoney(stats.totalRevenue)}</div>
        </div>

        <div className="earnings-stat-card">
          <div className="ui-badge ui-badge--warning">طلبات قيد الانتظار</div>
          <div className="earnings-stat-value">{formatMoney(stats.pendingRevenue)}</div>
        </div>

        <div className="earnings-stat-card">
          <div className="ui-badge ui-badge--success">طلبات مكتملة / مدفوعة</div>
          <div className="earnings-stat-value">{formatMoney(stats.completedRevenue)}</div>
        </div>
      </div>

      <div className="earnings-panel">
        <div className="earnings-panel__title">ملخص الأداء</div>
        <div className="earnings-panel__text">
          <div style={{ marginBottom: "10px" }}>
            <strong>عدد الطلبات:</strong> {stats.totalOrders}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>إجمالي الإيرادات:</strong> {formatMoney(stats.totalRevenue)}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>القيمة قيد الانتظار:</strong> {formatMoney(stats.pendingRevenue)}
          </div>
          <div>
            <strong>القيمة المكتملة:</strong> {formatMoney(stats.completedRevenue)}
          </div>
        </div>
      </div>
    </section>
  );
}
