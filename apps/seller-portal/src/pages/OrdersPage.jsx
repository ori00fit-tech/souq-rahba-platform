import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiGet, apiPatch } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function statusClass(status) {
  return `badge-${status}`;
}

export default function OrdersPage() {
  const { currentSeller, authLoading } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (!currentSeller) return;

        setLoading(true);

        const res = await apiGet(`/commerce/orders?seller_id=${currentSeller.id}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) loadOrders();
  }, [currentSeller, authLoading]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  async function updateStatus(orderId, orderStatus) {
    try {
      await apiPatch(`/commerce/orders/${orderId}/status`, {
        order_status: orderStatus
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: orderStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("فشل تحديث الحالة");
    }
  }

  if (loading || authLoading) {
    return <div className="page-shell">جاري تحميل الطلبات...</div>;
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <h1>الطلبات</h1>
        <p>إدارة وتتبع طلبات المتجر</p>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p>لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="grid">
          {orders.map((order) => (
            <div key={order.id} className="card">
              
              <div className="row between">
                <div>
                  <strong>طلب #{order.id}</strong>
                  <div className="muted">
                    {order.total_mad} {order.currency}
                  </div>
                </div>

                <span className={`badge ${statusClass(order.order_status)}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="muted small">
                الدفع: {order.payment_method} · {order.payment_status}
              </div>

              <div className="muted small">
                الشحن: {order.shipping_status}
              </div>

              <div className="actions">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(order.id, status)}
                    className={`btn ${order.order_status === status ? "btn-primary" : "btn-outline"}`}
                  >
                    {status}
                  </button>
                ))}

                <Link to={`/orders/${order.id}`} className="btn btn-secondary">
                  التفاصيل
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
