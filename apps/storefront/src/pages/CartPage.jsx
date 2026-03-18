import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function CartPage() {
  const { cart, cartCount, removeFromCart, updateQty, total, currency, language } = useApp();
  const locale = language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-US";

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>سلة التسوق</h1>
          <p style={s.muted}>راجع المنتجات المختارة قبل إتمام الطلب</p>
        </div>

        <div style={s.layout}>
          <div style={s.card}>
            {cart.length === 0 ? (
              <div style={s.empty}>
                <p style={{ margin: 0 }}>السلة فارغة حالياً.</p>
                <Link to="/products" style={s.emptyBtn}>
                  تصفح المنتجات
                </Link>
              </div>
            ) : (
              <div style={s.items}>
                {cart.map((item) => (
                  <article key={item.id} style={s.itemCard}>
                    <div style={s.itemMain}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={s.itemImage} />
                      ) : (
                        <div style={s.noImage}>No image</div>
                      )}

                      <div style={s.itemBody}>
                        <div style={s.itemSeller}>{item.seller || "RAHBA"}</div>
                        <h3 style={s.itemTitle}>{item.name}</h3>
                        <p style={s.itemPrice}>
                          {formatMoney(item.price || item.price_mad || 0, currency, locale)}
                        </p>

                        <div style={s.qtyWrap}>
                          <label style={s.qtyLabel}>الكمية</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty || item.quantity || 1}
                            onChange={(e) => updateQty(item.id, Number(e.target.value))}
                            style={s.qtyInput}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={s.itemSide}>
                      <div style={s.lineTotal}>
                        {formatMoney(
                          Number(item.price || item.price_mad || 0) * Number(item.qty || item.quantity || 1),
                          currency,
                          locale
                        )}
                      </div>

                      <button style={s.removeBtn} onClick={() => removeFromCart(item.id)}>
                        حذف
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside style={s.card}>
            <h2 style={s.summaryTitle}>ملخص السلة</h2>

            <div style={s.summaryRow}>
              <span>عدد المنتجات</span>
              <strong>{cartCount}</strong>
            </div>

            <div style={s.summaryRow}>
              <span>الإجمالي</span>
              <strong>{formatMoney(total, currency, locale)}</strong>
            </div>

            <Link
              to={cart.length > 0 ? "/checkout" : "/products"}
              style={s.checkoutBtn}
            >
              {cart.length > 0 ? "إتمام الطلب" : "العودة للمنتجات"}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

const s = {
  page: {
    display: "grid",
    gap: "18px"
  },
  header: {
    display: "grid",
    gap: "6px"
  },
  title: {
    margin: 0,
    color: "#1b3a6b"
  },
  muted: {
    margin: 0,
    color: "#6e6357"
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "18px",
    alignItems: "start"
  },
  card: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 28px rgba(27,58,107,0.06)"
  },
  empty: {
    display: "grid",
    gap: "14px",
    justifyItems: "start"
  },
  emptyBtn: {
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#1b3a6b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800
  },
  items: {
    display: "grid",
    gap: "14px"
  },
  itemCard: {
    border: "1px solid #eee4d8",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  itemMain: {
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: "14px",
    alignItems: "center",
    flex: 1,
    minWidth: "260px"
  },
  itemImage: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e6dccf"
  },
  noImage: {
    width: "90px",
    height: "90px",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#94a3b8",
    border: "1px solid #e6dccf"
  },
  itemBody: {
    display: "grid",
    gap: "6px"
  },
  itemSeller: {
    color: "#6e6357",
    fontSize: "13px"
  },
  itemTitle: {
    margin: 0,
    color: "#221d16",
    fontSize: "18px"
  },
  itemPrice: {
    margin: 0,
    color: "#1b3a6b",
    fontWeight: 800
  },
  qtyWrap: {
    display: "grid",
    gap: "6px",
    maxWidth: "110px"
  },
  qtyLabel: {
    fontSize: "13px",
    color: "#6e6357",
    fontWeight: 700
  },
  qtyInput: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e6dccf"
  },
  itemSide: {
    display: "grid",
    gap: "10px",
    justifyItems: "end"
  },
  lineTotal: {
    fontWeight: 900,
    color: "#221d16"
  },
  removeBtn: {
    border: "1px solid #efc9c9",
    background: "#fff5f5",
    color: "#b42318",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  summaryTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#1b3a6b"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #efe7db"
  },
  checkoutBtn: {
    marginTop: "18px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#1b3a6b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800
  }
};
