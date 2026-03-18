import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, currency, language, cartCount = 0 } = useApp();
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-US";

  return (
    <section className="container section-space" dir="rtl">
      <div className="cart-page-shell">
        <div className="cart-page-head">
          <h1>سلة التسوق</h1>
          <p>راجع المنتجات، عدّل الكميات، ثم انتقل لإتمام الطلب.</p>
        </div>

        <div className="cart-layout">
          <div className="panel-card">
            {cart.length === 0 ? (
              <div className="ui-empty">
                السلة فارغة حالياً.
              </div>
            ) : (
              <div className="cart-list-modern">
                {cart.map((item) => {
                  const qty = Number(item.qty || item.quantity || 1);
                  const lineTotal = Number(item.price || item.price_mad || 0) * qty;

                  return (
                    <article key={item.id} className="cart-item-modern">
                      <div className="cart-item-media">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="cart-item-image" />
                        ) : (
                          <div className="cart-item-noimage">
                            {String(item.name || "?").charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="cart-item-main">
                        <div className="cart-item-top">
                          <div>
                            <h3 className="cart-item-title">{item.name}</h3>
                            <div className="cart-item-meta">
                              {item.seller || "RAHBA"}{item.city ? ` • ${item.city}` : ""}
                            </div>
                          </div>

                          <div className="cart-item-price">
                            {formatMoney(lineTotal, currency, locale)}
                          </div>
                        </div>

                        <div className="cart-item-desc">
                          {item.description || "منتج مضاف إلى سلتك داخل رحبة."}
                        </div>

                        <div className="cart-item-actions">
                          <div className="cart-qty-box">
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => updateQty(item.id, qty - 1)}
                            >
                              −
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) => updateQty(item.id, Number(e.target.value))}
                              className="cart-qty-input"
                            />

                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => updateQty(item.id, qty + 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => removeFromCart(item.id)}
                          >
                            حذف
                          </button>

                          <Link className="btn btn-primary" to={`/products/${item.slug}`}>
                            عرض المنتج
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="panel-card cart-summary-card">
            <h3>ملخص السلة</h3>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>عدد المنتجات</span>
                <strong>{cartCount}</strong>
              </div>

              <div className="cart-summary-row">
                <span>الإجمالي</span>
                <strong>{formatMoney(total, currency, locale)}</strong>
              </div>
            </div>

            <div className="cart-summary-note">
              سيتم تقسيم الطلب تلقائياً حسب كل بائع عند إتمام الشراء.
            </div>

            <Link to="/checkout" className="btn btn-primary full-width">
              متابعة إلى إتمام الطلب
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
