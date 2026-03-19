import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, total, currency, language, cartCount } = useApp();

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + shipping;

  function decreaseQty(item) {
    const nextQty = Number(item.qty || item.quantity || 1) - 1;
    if (nextQty < 1) {
      removeFromCart(item.id);
      return;
    }
    updateQty(item.id, nextQty);
  }

  function increaseQty(item) {
    const current = Number(item.qty || item.quantity || 1);
    updateQty(item.id, current + 1);
  }

  if (!cart || cart.length === 0) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA CART</div>
            <h1 className="page-title">السلة</h1>
            <p className="page-subtitle">
              السلة فارغة حالياً. أضف بعض المنتجات ثم عد لإتمام الطلب.
            </p>
          </div>

          <div className="empty-state" style={s.emptyCard}>
            <div style={s.emptyIcon}>🛒</div>
            <h3 style={s.emptyTitle}>لم تضف أي منتج بعد</h3>
            <p style={s.emptyText}>
              تصفح المنتجات المناسبة لك وابدأ بإضافة أول منتج إلى السلة.
            </p>

            <Link to="/products" className="btn btn-primary full-width">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA CART</div>
          <h1 className="page-title">سلة التسوق</h1>
          <p className="page-subtitle">
            راجع المنتجات، عدّل الكمية، ثم أكمل الطلب عبر Checkout.
          </p>

          <div style={s.metaRow}>
            <span className="ui-chip">{cartCount || cart.length} عنصر</span>
            <span className="ui-chip">
              {formatMoney(total, currency, locale)}
            </span>
          </div>
        </div>

        <div style={s.layout}>
          <div style={s.itemsCol}>
            {cart.map((item) => {
              const qty = Number(item.qty || item.quantity || 1);
              const unitPrice = Number(item.price ?? item.price_mad ?? 0);
              const lineTotal = unitPrice * qty;

              return (
                <article key={item.id} className="ui-card" style={s.itemCard}>
                  <div style={s.itemMedia}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={s.itemImage}
                      />
                    ) : (
                      <div style={s.itemNoImage}>No image</div>
                    )}
                  </div>

                  <div style={s.itemBody}>
                    <div style={s.itemTop}>
                      <div>
                        <h3 style={s.itemTitle}>{item.name}</h3>
                        <div style={s.itemMeta}>
                          {item.seller || "RAHBA"}
                          {item.city ? ` • ${item.city}` : ""}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-soft"
                        style={s.removeBtn}
                      >
                        حذف
                      </button>
                    </div>

                    <div style={s.itemBottom}>
                      <div style={s.qtyControl}>
                        <button
                          type="button"
                          onClick={() => increaseQty(item)}
                          style={s.qtyBtn}
                        >
                          +
                        </button>

                        <span style={s.qtyValue}>{qty}</span>

                        <button
                          type="button"
                          onClick={() => decreaseQty(item)}
                          style={s.qtyBtn}
                        >
                          −
                        </button>
                      </div>

                      <div style={s.priceBlock}>
                        <div style={s.unitPrice}>
                          {formatMoney(unitPrice, currency, locale)}
                        </div>
                        <div style={s.lineTotal}>
                          {formatMoney(lineTotal, currency, locale)}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title" style={s.summaryTitle}>ملخص الطلب</h2>

            <div style={s.summaryRows}>
              <div style={s.summaryRow}>
                <span>المجموع الفرعي</span>
                <strong>{formatMoney(total, currency, locale)}</strong>
              </div>

              <div style={s.summaryRow}>
                <span>التوصيل</span>
                <strong>{shipping === 0 ? "مجاني" : formatMoney(shipping, currency, locale)}</strong>
              </div>

              <div style={s.divider} />

              <div style={s.summaryRowTotal}>
                <span>الإجمالي</span>
                <strong>{formatMoney(grandTotal, currency, locale)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="btn btn-primary full-width"
            >
              متابعة إلى Checkout
            </button>

            <Link to="/products" className="btn btn-secondary full-width" style={s.backBtn}>
              متابعة التسوق
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "10px"
  },
  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  layout: {
    display: "grid",
    gap: "14px"
  },
  itemsCol: {
    display: "grid",
    gap: "12px"
  },
  itemCard: {
    overflow: "hidden"
  },
  itemMedia: {
    borderBottom: "1px solid #eee6da"
  },
  itemImage: {
    width: "100%",
    height: "210px",
    objectFit: "cover",
    display: "block"
  },
  itemNoImage: {
    width: "100%",
    height: "210px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    color: "#94a3b8"
  },
  itemBody: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },
  itemTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "18px",
    lineHeight: 1.5,
    fontWeight: 900
  },
  itemMeta: {
    marginTop: "6px",
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  removeBtn: {
    minHeight: "40px",
    paddingInline: "12px",
    flexShrink: 0
  },
  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fbff",
    border: "1px solid #d7e2ef",
    borderRadius: "16px",
    padding: "6px"
  },
  qtyBtn: {
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "12px",
    background: "#fff",
    color: "#173b74",
    fontWeight: 900,
    fontSize: "20px",
    cursor: "pointer"
  },
  qtyValue: {
    minWidth: "34px",
    textAlign: "center",
    fontWeight: 900,
    color: "#173b74"
  },
  priceBlock: {
    display: "grid",
    gap: "4px",
    textAlign: "left"
  },
  unitPrice: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  lineTotal: {
    color: "#173b74",
    fontSize: "20px",
    fontWeight: 900
  },
  summaryCard: {
    padding: "16px",
    display: "grid",
    gap: "14px",
    position: "sticky",
    bottom: "12px"
  },
  summaryTitle: {
    fontSize: "22px"
  },
  summaryRows: {
    display: "grid",
    gap: "12px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4b5563",
    fontWeight: 700
  },
  summaryRowTotal: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  divider: {
    height: "1px",
    background: "#e9dfd2"
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCard: {
    display: "grid",
    gap: "12px"
  },
  emptyIcon: {
    fontSize: "40px"
  },
  emptyTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900
  },
  emptyText: {
    margin: 0,
    color: "#7a6f63",
    lineHeight: 1.8
  }
};
