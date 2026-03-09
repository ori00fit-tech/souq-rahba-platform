import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiPost } from "../lib/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, total, clearCart, currentUser, authLoading } = useApp();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    paymentMethod: "cash_on_delivery",
    shippingMethod: "standard",
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const uniqueSellerIds = useMemo(() => {
    return [...new Set(cart.map((item) => item.seller_id).filter(Boolean))];
  }, [cart]);

  const canCheckout =
    cart.length > 0 &&
    uniqueSellerIds.length === 1 &&
    !!currentUser &&
    currentUser.role === "buyer";

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handlePlaceOrder() {
    try {
      if (authLoading) {
        setMessage("جاري التحقق من الجلسة...");
        return;
      }

      if (!currentUser) {
        setMessage("يجب تسجيل الدخول أولاً قبل إتمام الطلب");
        navigate("/auth");
        return;
      }

      if (currentUser.role !== "buyer") {
        setMessage("فقط حسابات المشترين يمكنها إنشاء الطلبات");
        return;
      }

      if (cart.length === 0) {
        setMessage("السلة فارغة");
        return;
      }

      if (uniqueSellerIds.length !== 1) {
        setMessage("حالياً يجب أن تكون كل منتجات السلة من نفس البائع");
        return;
      }

      if (!form.fullName || !form.phone || !form.city || !form.address) {
        setMessage("يرجى إدخال معلومات المشتري والعنوان كاملة");
        return;
      }

      const sellerId = uniqueSellerIds[0];

      setSubmitting(true);
      setMessage("");

      const result = await apiPost("/commerce/orders", {
        buyer_user_id: currentUser.id,
        seller_id: sellerId,
        payment_method: form.paymentMethod,
        shipping_status: "pending",
        payment_status: "pending",
        order_status: "pending",
        customer: {
          full_name: form.fullName,
          phone: form.phone,
          city: form.city,
          address: form.address,
          notes: form.notes,
          shipping_method: form.shippingMethod
        },
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
          unit_price_mad: item.price
        }))
      });

      if (result.ok) {
        clearCart();
        setMessage(`تم إنشاء الطلب بنجاح. رقم الطلب: ${result.data.id}`);
        setTimeout(() => {
          navigate("/my-orders");
        }, 1000);
      } else {
        setMessage("فشل إنشاء الطلب");
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space checkout-grid">
      <div className="panel-card">
        <h1>Checkout</h1>

        <div className="form-grid">
          <input
            name="fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="cash_on_delivery">Cash on delivery</option>
            <option value="card_payment">Card payment</option>
            <option value="bank_transfer">Bank transfer</option>
          </select>
          <select
            name="shippingMethod"
            value={form.shippingMethod}
            onChange={handleChange}
          >
            <option value="standard">Standard shipping</option>
            <option value="express">Express shipping</option>
          </select>
          <textarea
            name="notes"
            placeholder="Notes for delivery"
            rows="4"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="panel-card">
        <h3>Compliance reminders</h3>
        <ul className="feature-list">
          <li>Right of withdrawal policy</li>
          <li>Invoice generation workflow</li>
          <li>Seller responsibility and return rules</li>
          <li>Privacy notice and cookie consent</li>
        </ul>

        <div style={{ marginBottom: "16px", fontWeight: "700" }}>
          Total: {total} MAD
        </div>

        {!currentUser && !authLoading ? (
          <p style={{ marginBottom: "16px", color: "#b45309" }}>
            يجب تسجيل الدخول كمشتري قبل إتمام الطلب.
          </p>
        ) : null}

        {!canCheckout && cart.length > 0 && currentUser ? (
          <p style={{ marginBottom: "16px", color: "#b45309" }}>
            السلة الحالية غير قابلة للطلب لأن المنتجات ليست موحدة المصدر أو بياناتها ناقصة.
          </p>
        ) : null}

        <button
          className="btn btn-primary full-width"
          onClick={handlePlaceOrder}
          disabled={submitting || authLoading || !canCheckout}
        >
          {submitting ? "Placing order..." : "Place order"}
        </button>

        {message ? (
          <p style={{ marginTop: "16px" }}>{message}</p>
        ) : null}
      </div>
    </section>
  );
}
