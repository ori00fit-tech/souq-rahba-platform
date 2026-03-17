import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

function statusClass(status) {
  return `badge-${status}`;
}

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await apiGet(`/commerce/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert("تعذر تحميل الطلب");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return <section className="page-shell">جاري تحميل الطلب...</section>;
  }

  if (!order) {
    return <section className="page-shell">الطلب غير موجود</section>;
  }

  return (
    <section className="page-shell">

      <div className="page-header">
        <h1>تفاصيل الطلب</h1>
        <p>طلب رقم #{order.id}</p>
      </div>

      <Link to="/orders" className="btn btn-secondary">
        الرجوع للطلبات
      </Link>

      {/* ORDER INFO */}
      <div className="card">

        <div className="row between">
          <strong>الحالة</strong>
          <span className={`badge ${statusClass(order.order_status)}`}>
            {order.order_status}
          </span>
        </div>

        <div className="grid">
          <div>المشتري: {order.buyer_user_id || "Guest"}</div>
          <div>البائع: {order.seller_id}</div>
          <div>الإجمالي: {order.total_mad} {order.currency}</div>
          <div>طريقة الدفع: {order.payment_method}</div>
          <div>حالة الدفع: {order.payment_status}</div>
          <div>الشحن: {order.shipping_status}</div>
          <div>تاريخ الطلب: {order.created_at}</div>
        </div>

      </div>

      {/* ITEMS */}
      <div className="card">
        <h3>المنتجات</h3>

        {order.items?.length ? (
          <div className="grid">
            {order.items.map((item) => (
              <div key={item.id} className="card">

                <strong>{item.title_ar || item.product_id}</strong>

                <div className="muted small">
                  Slug: {item.slug || "-"}
                </div>

                <div className="row between">
                  <span>الكمية: {item.quantity}</span>
                  <span>{item.unit_price_mad} MAD</span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <p className="muted">لا توجد منتجات</p>
        )}

      </div>

    </section>
  );
}
