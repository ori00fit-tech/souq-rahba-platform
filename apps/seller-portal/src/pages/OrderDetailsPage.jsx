import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

function badgeStyle(status) {
  if (status === "delivered") {
    return {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #bbf7d0"
    };
  }

  if (status === "shipped") {
    return {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe"
    };
  }

  if (status === "confirmed") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a"
    };
  }

  if (status === "cancelled") {
    return {
      background: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca"
    };
  }

  return {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1"
  };
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setMessage("");

        const res = await apiGet(`/commerce/orders/${id}`);

        if (!res?.ok) {
          setMessage(res?.message || "تعذر تحميل تفاصيل الطلب");
          return;
        }

        setOrder(res.data || null);
      } catch (err) {
        console.error(err);
        setMessage(err.message || "تعذر تحميل تفاصيل الطلب");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return <div>جاري تحميل تفاصيل الطلب...</div>;
  }

  if (message) {
    return (
      <div style={{ display: "grid", gap: "16px" }} dir="rtl">
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "18px"
          }}
        >
          {message}
        </div>

        <div>
          <Link
            to="/orders"
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#111827",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "700"
            }}
          >
            الرجوع إلى الطلبات
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div>الطلب غير موجود.</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }} dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>تفاصيل الطلب</h2>
          <p style={{ color: "#64748b", marginTop: "6px" }}>
            رقم الطلب #{order.id}
          </p>
        </div>

        <Link
          to="/orders"
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#111827",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "700",
            height: "fit-content"
          }}
        >
          العودة إلى الطلبات
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "18px",
          display: "grid",
          gap: "12px"
        }}
      >
        <div><strong>المشتري:</strong> {order.buyer_user_id || "زائر"}</div>
        <div><strong>البائع:</strong> {order.seller_id}</div>
        <div><strong>الإجمالي:</strong> {order.total_mad} {order.currency}</div>
        <div><strong>طريقة الدفع:</strong> {order.payment_method}</div>
        <div><strong>حالة الدفع:</strong> {order.payment_status}</div>
        <div><strong>حالة الشحن:</strong> {order.shipping_status}</div>
        <div>
          <strong>حالة الطلب:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              marginInlineStart: "8px",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "700",
              ...badgeStyle(order.order_status)
            }}
          >
            {order.order_status}
          </span>
        </div>
        <div><strong>تاريخ الإنشاء:</strong> {order.created_at}</div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "18px",
          display: "grid",
          gap: "12px"
        }}
      >
        <h3 style={{ margin: 0 }}>عناصر الطلب</h3>

        {order.items?.length ? (
          order.items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "14px",
                display: "grid",
                gap: "6px"
              }}
            >
              <div><strong>{item.title_ar || item.product_id}</strong></div>
              <div style={{ color: "#64748b" }}>Slug: {item.slug || "-"}</div>
              <div>الكمية: {item.quantity}</div>
              <div>ثمن الوحدة: {item.unit_price_mad} MAD</div>
            </div>
          ))
        ) : (
          <p style={{ margin: 0 }}>لا توجد عناصر داخل هذا الطلب.</p>
        )}
      </div>
    </div>
  );
}
