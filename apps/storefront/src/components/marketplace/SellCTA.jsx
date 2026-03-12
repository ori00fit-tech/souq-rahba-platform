import { SELLER_PORTAL_URL } from "../../lib/config";

const T = { navy: "#16356b", blue: "#1d4ed8", border: "#ddd5c2" };

const perks = [
  { icon: "🏪", label: "Free store setup" },
  { icon: "📦", label: "Easy product listing" },
  { icon: "📊", label: "Sales dashboard" },
  { icon: "💬", label: "Direct messaging" },
];

export default function SellCTA() {
  return (
    <section style={s.section}>
      {/* left / text side */}
      <div style={s.content}>
        <div style={s.eyebrow}>For Sellers</div>
        <h2 style={s.title}>Sell on RAHBA</h2>
        <p style={s.sub}>
          Create your seller profile, add products, manage orders and grow your store on the marketplace.
        </p>

        <div style={s.perks}>
          {perks.map((p) => (
            <div key={p.label} style={s.perk}>
              <span>{p.icon}</span>
              <span style={s.perkLabel}>{p.label}</span>
            </div>
          ))}
        </div>

        <a
          href={SELLER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={s.btn}
        >
          Open Seller Portal ↗
        </a>
      </div>

      {/* right / decorative */}
      <div style={s.deco} aria-hidden="true">
        <div style={s.decoInner}>🏷️</div>
      </div>
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "24px",
    alignItems: "center",
    background: \`linear-gradient(135deg, \${T.navy} 0%, \${T.blue} 100%)\`,
    borderRadius: "22px",
    padding: "28px 24px",
    color: "#fff",
    overflow: "hidden",
    position: "relative",
  },

  content: { display: "grid", gap: "14px" },

  eyebrow: {
    display: "inline-block",
    width: "fit-content",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "999px",
    padding: "4px 12px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 900,
    lineHeight: 1.2,
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.80)",
    fontSize: "14px",
    lineHeight: 1.7,
    maxWidth: "460px",
  },

  perks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  perk: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "999px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: 600,
  },

  perkLabel: { color: "rgba(255,255,255,0.90)" },

  btn: {
    display: "inline-block",
    width: "fit-content",
    textDecoration: "none",
    padding: "13px 22px",
    borderRadius: "14px",
    background: "#fff",
    color: T.navy,
    fontWeight: 900,
    fontSize: "14px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
  },

  deco: {
    display: "grid",
    placeItems: "center",
  },

  decoInner: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    fontSize: "38px",
  },
};
