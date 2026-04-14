import { SELLER_PORTAL_URL } from "../../lib/config";
import { UI } from "./uiTokens";

const perks = [
  { icon: ChatIcon, label: "مراسلة المشترين" },
  { icon: ChartIcon, label: "تتبع المبيعات" },
  { icon: BoxIcon, label: "إدارة المنتجات" },
  { icon: StoreIcon, label: "متجر مجاني" }
];

export default function SellCTA() {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.content}>
        <div style={s.badge}>للباعة</div>

        <h2 style={s.title}>ابدأ البيع على رحبة</h2>

        <p style={s.subtitle}>
          أنشئ متجرك، أضف منتجاتك، ووسّع نشاطك التجاري داخل منصة مغربية حديثة.
        </p>

        <div style={s.perks}>
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.label} style={s.perk}>
                <Icon />
                <span>{perk.label}</span>
              </div>
            );
          })}
        </div>

        <a
          href={SELLER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={s.btn}
        >
          دخول بوابة البائع
        </a>
      </div>

      <div style={s.decoration}>
        <div style={s.decoInner}>
          <StoreIconLarge />
        </div>
      </div>
    </section>
  );
}

// Icons
function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6l-3 2v-2a2 2 0 01-1-2V4z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 14V8M8 14V4M13 14V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 8V14M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 6l1-4h10l1 4M2 6v7a1 1 0 001 1h10a1 1 0 001-1V6M2 6h12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIconLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M5 15l3-10h24l3 10M5 15v17a2 2 0 002 2h26a2 2 0 002-2V15M5 15h30" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 34v-10h8v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const s = {
  section: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    background: `linear-gradient(135deg, ${UI.colors.primary} 0%, ${UI.colors.teal} 100%)`,
    borderRadius: UI.radius.lg,
    padding: "24px",
    position: "relative",
    overflow: "hidden"
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "relative",
    zIndex: 1
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    height: "26px",
    padding: "0 12px",
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: UI.radius.pill,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em"
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.2
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255, 255, 255, 0.8)",
    maxWidth: "400px"
  },
  perks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  perk: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: UI.radius.pill,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "12px",
    fontWeight: 500
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    height: "48px",
    padding: "0 24px",
    background: "#fff",
    color: UI.colors.primary,
    borderRadius: UI.radius.md,
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  },
  decoration: {
    display: "none",
    "@media (min-width: 640px)": {
      display: "flex"
    }
  },
  decoInner: {
    width: "80px",
    height: "80px",
    borderRadius: UI.radius.lg,
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255, 255, 255, 0.9)"
  }
};
