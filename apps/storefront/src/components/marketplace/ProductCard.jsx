import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const T = { navy: "#16356b", gold: "#b08d3c", border: "#ddd5c2", shadow: "rgba(22,53,107,0.08)" };

export default function ProductCard({ product }) {
  const { addToCart } = useApp?.() ?? {};

  return (
    <article style={s.card}>
      {/* image */}
      <div style={s.imgWrap}>
        {product.image
          ? <img src={product.image} alt={product.title} style={s.img} loading="lazy" />
          : <div style={s.noImg}>📦</div>
        }
        <div style={s.ratingBadge}>★ {product.rating}</div>
      </div>

      {/* body */}
      <div style={s.body}>
        <div style={s.seller}>{product.seller}</div>
        <h3 style={s.title}>{product.title}</h3>
        <div style={s.price}>{product.price} <span style={s.currency}>MAD</span></div>
      </div>

      {/* actions */}
      <div style={s.actions}>
        {addToCart && (
          <button
            onClick={() => addToCart(product)}
            style={s.cartBtn}
            aria-label="Add to cart"
          >
            🛒
          </button>
        )}
        <Link to={product.href ?? "/products"} style={s.viewBtn}>
          View
        </Link>
      </div>
    </article>
  );
}

const s = {
  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "18px",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    boxShadow: `0 4px 16px ${T.shadow}`,
  },
  imgWrap: {
    position: "relative",
    height: "170px",
    background: "#f8f6f0",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    width: "100%", height: "100%",
    display: "grid", placeItems: "center",
    fontSize: "40px", color: "#d1c9b8",
  },
  ratingBadge: {
    position: "absolute", top: "10px", right: "10px",
    background: "rgba(255,255,255,0.92)",
    border: `1px solid ${T.border}`,
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "12px", fontWeight: 800,
    color: T.gold,
  },
  body: { padding: "14px 14px 8px", display: "grid", gap: "4px" },
  seller: { fontSize: "12px", color: "#94a3b8", fontWeight: 600 },
  title: { margin: 0, fontSize: "15px", fontWeight: 800, color: T.navy, lineHeight: 1.4 },
  price: { fontSize: "19px", fontWeight: 900, color: "#111827", marginTop: "4px" },
  currency: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  actions: {
    padding: "0 14px 14px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "8px",
  },
  cartBtn: {
    width: "40px", height: "40px",
    borderRadius: "12px",
    border: `1.5px solid ${T.border}`,
    background: "#f5f1e8",
    display: "grid", placeItems: "center",
    fontSize: "17px", cursor: "pointer",
  },
  viewBtn: {
    textDecoration: "none",
    display: "grid", placeItems: "center",
    borderRadius: "12px",
    background: T.navy,
    color: "#fff",
    fontSize: "13px", fontWeight: 800,
    padding: "0 14px", height: "40px",
  },
};
