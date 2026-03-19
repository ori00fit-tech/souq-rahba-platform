import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, total, currency, language, cartCount } = useApp();

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const normalizedCart = useMemo(() => {
    if (!Array.isArray(cart)) return [];

    return cart.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name || "منتج",
      seller_id: item.seller_id || "unknown",
      seller: item.seller || "بائع غير معروف",
      city: item.city || "",
      image_url: item.image_url || "",
      price: Number(item.price ?? 0),
      qty: Number(item.qty || item.quantity || 1)
    }));
  }, [cart]);

  const groupedBySeller = useMemo(() => {
    const map = new Map();

    for (const item of normalizedCart) {
      if (!map.has(item.seller_id)) {
        map.set(item.seller_id, {
          seller_id: item.seller_id,
          seller_name: item.seller,
          items: []
        });
      }

      map.get(item.seller_id).items.push(item);
    }

    return Array.from(map.values()).map((group) => ({
      ...group,
      subtotal: group.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    }));
  }, [normalizedCart]);

  const sellerCount = groupedBySeller.length;
  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + shipping;

  function decreaseQty(item) {
    const nextQty = item.qty - 1;
    if (nextQty < 1) {
      removeFromCart(item.id);
      return;
    }
    updateQty(item.id, nextQty);
  }

  function increaseQty(item) {
    updateQty(item.id, item.qty + 1);
  }

  if (!normalizedCart.length) {
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
            راجع المنتجات، عدّل الكميات، ثم أكمل الطلب بسهولة.
          </p>

          <div style={s.metaRow}>
            <span className="ui-chip">{cartCount || normalizedCart.length} عنصر</span>
            <span className="ui-chip">{sellerCount} بائع</span>
            <span className="ui-chip">{formatMoney(total, currency, locale)}</span>
          </div>
        </div>

        {sellerCount > 1 ? (
          <div className="ui-card-soft" style={s.splitNotice}>
            <strong style={s.splitTitle}>📦 السلة متعددة الباعة</strong>
            <div style={s.splitText}>
              سيتم تقسيم هذه السلة إلى <strong>{sellerCount} طلبات</strong> عند إتمام الشراء،
              طلب مستقل لكل بائع.
            </div>
          </div>
        ) : (
          <div className="ui-card-soft" style={s.singleNotice}>
            <strong style={s.splitTitle}>طلب واحد</strong>
            <div style={s.splitText}>
              كل المنتجات الحالية من نفس البائع، وسيتم إنشاء طلب واحد فقط.
            </div>
          </div>
        )}

        <div style={s.layout}>
          <div style={s.itemsCol}>
            {groupedBySeller.map((group) => (
              <section key={group.seller_id} className="ui-card" style={s.sellerSection}>
                <div style={s.sellerHeader}>
                  <div>
                    <div style={s.sellerName}>{group.seller_name}</div>
                    <div style={s.sellerMeta}>
                      {group.items.length} منتج
                    </div>
                  </div>

                  <div style={s.sellerSubtotal}>
                    {formatMoney(group.subtotal, currency, locale)}
                  </div>
                </div>

                <div style={s.groupItems}>
                  {group.items.map((item) => {
                    const lineTotal = item.price * item.qty;

                    return (
                      <article key={item.id} className="ui-card-soft" style={s.itemCard}>
                        <div style={s.itemTop}>
                          <div style={s.itemInfo}>
                            <div style={s.itemTitle}>{item.name}</div>
                            <div style={s.itemMeta}>
                              {item.city ? item.city : group.seller_name}
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

                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={s.itemImage} />
                        ) : null}

                        <div style={s.itemBottom}>
                          <div style={s.qtyControl}>
                            <button
                              type="button"
                              onClick={() => increaseQty(item)}
                              style={s.qtyBtn}
                            >
                              +
                            </button>

                            <span style={s.qtyValue}>{item.qty}</span>

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
                              {formatMoney(item.price, currency, locale)}
                            </div>
                            <div style={s.lineTotal}>
                              {formatMoney(lineTotal, currency, locale)}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title" style={s.summaryTitle}>ملخص السلة</h2>

            <div style={s.summaryRows}>
              <div style={s.summaryRow}>
                <span>عدد العناصر</span>
                <strong>{cartCount || normalizedCart.length}</strong>
              </div>

              <div style={s.summaryRow}>
                <span>عدد الباعة</span>
                <strong>{sellerCount}</strong>
              </div>

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
  splitNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#fff7e6",
    border: "1px solid #f3d7a4"
  },
  singleNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#eef6ff",
    border: "1px solid #d3e4f8"
  },
  splitTitle: {
    color: "#173b74"
  },
  splitText: {
    color: "#5b6470",
    lineHeight: 1.8
  },
  layout: {
    display: "grid",
    gap: "14px"
  },
  itemsCol: {
    display: "grid",
    gap: "12px"
  },
  sellerSection: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  sellerHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap"
  },
  sellerName: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  sellerMeta: {
    marginTop: "4px",
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  sellerSubtotal: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  groupItems: {
    display: "grid",
    gap: "10px"
  },
  itemCard: {
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },
  itemInfo: {
    display: "grid",
    gap: "4px"
  },
  itemTitle: {
    color: "#1f2937",
    fontWeight: 900,
    lineHeight: 1.6
  },
  itemMeta: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  removeBtn: {
    minHeight: "40px",
    paddingInline: "12px",
    flexShrink: 0
  },
  itemImage: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #ece3d8"
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
    gap: "14px"
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
