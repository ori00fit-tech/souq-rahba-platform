import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiPost } from "../lib/api";
import { formatMoney } from "../lib/utils";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, total, currency, clearCart } = useApp();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    city: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.full_name || !form.phone || !form.city || !form.address) {
      setMessage("يرجى ملء جميع الحقول");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await apiPost("/commerce/orders", {
  seller_id: cart[0]?.seller_id,
  payment_method: "cod",

  buyer_name: form.full_name,
  buyer_phone: form.phone,
  buyer_city: form.city,
  buyer_address: form.address,

  items: cart.map((item) => ({
    product_id: item.id,
    quantity: item.qty || item.quantity || 1
  }))
});

      if (!res.ok) {
        setMessage(res.message || "فشل إنشاء الطلب");
        return;
      }

      clearCart();
      navigate("/my-orders");

    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء الطلب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="checkout-shell">

        <div className="checkout-head">
          <h1>إتمام الطلب</h1>
          <p>أدخل معلوماتك لإكمال عملية الشراء</p>
        </div>

        <div className="checkout-grid-modern">

          {/* FORM */}
          <form onSubmit={handleSubmit} className="panel-card checkout-form">

            <div className="checkout-group">
              <label>الاسم الكامل</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="ui-input"
              />
            </div>

            <div className="checkout-group">
              <label>رقم الهاتف</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="ui-input"
              />
            </div>

            <div className="checkout-group">
              <label>المدينة</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="ui-input"
              />
            </div>

            <div className="checkout-group">
              <label>العنوان</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="ui-textarea"
              />
            </div>

            {message && <div className="product-info-box">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary full-width"
            >
              {loading ? "جاري المعالجة..." : "تأكيد الطلب"}
            </button>

          </form>

          {/* SUMMARY */}
          <aside className="panel-card checkout-summary">

            <h3>ملخص الطلب</h3>

            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item">
                  <span>{item.name}</span>
                  <strong>
                    {formatMoney(
                      (item.price || 0) * (item.qty || 1),
                      currency
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>الإجمالي</span>
              <strong>{formatMoney(total, currency)}</strong>
            </div>

          </aside>

        </div>
      </div>
    </section>
  );
}
