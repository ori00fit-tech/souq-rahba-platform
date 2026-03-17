import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await apiGet("/orders");

      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, status) {
    try {
      await apiPatch(`/orders/${id}`, { status });
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="page-shell" dir="rtl">
      <h1>الطلبات</h1>

      <div style={{ display: "grid", gap: "16px" }}>
        {orders.map((order) => (
          <div key={order.id} style={s.card}>
            <div style={s.header}>
              <div>
                <strong>#{order.id}</strong>
                <div>{order.status}</div>
              </div>
              <div>{order.total} MAD</div>
            </div>

            {/* 👤 CUSTOMER */}
            <div style={s.section}>
              <h4>معلومات المشتري</h4>
              <div>{order.customer?.name}</div>
              <div>{order.customer?.phone}</div>
              <div>{order.customer?.city}</div>
              <div>{order.customer?.address}</div>
            </div>

            {/* 🛒 ITEMS */}
            <div style={s.section}>
              <h4>المنتجات</h4>
              {order.items?.map((item, i) => (
                <div key={i} style={s.item}>
                  <span>{item.title}</span>
                  <span>x{item.quantity}</span>
                  <span>{item.price} MAD</span>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div style={s.actions}>
              <button onClick={() => updateStatus(order.id, "confirmed")}>
                تأكيد
              </button>
              <button onClick={() => updateStatus(order.id, "shipped")}>
                تم الشحن
              </button>
              <button onClick={() => updateStatus(order.id, "delivered")}>
                تم التسليم
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700"
  },
  section: {
    background: "#f8fafc",
    padding: "10px",
    borderRadius: "12px"
  },
  item: {
    display: "flex",
    justifyContent: "space-between"
  },
  actions: {
    display: "flex",
    gap: "10px"
  }
};
