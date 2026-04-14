import { UI } from "../uiTokens";

const items = [
  { icon: TruckIcon, text: "شحن سريع لجميع المدن" },
  { icon: CashIcon, text: "الدفع عند الاستلام" },
  { icon: ShieldIcon, text: "باعة موثوقون" },
  { icon: TrackIcon, text: "تتبع طلبك بسهولة" }
];

export default function HomeCommerceStrip() {
  return (
    <div style={s.strip} dir="rtl">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} style={s.item}>
            <Icon />
            <span>{item.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 3h9v8H1zM10 5.5h3l2 2.5v3h-5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L2 3.5v4.5c0 3.5 2.5 5.5 6 7 3.5-1.5 6-3.5 6-7V3.5L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.5 8l1.75 1.75L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

const s = {
  strip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    padding: "14px 20px",
    background: UI.colors.surface,
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch"
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: UI.colors.textSecondary,
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap"
  }
};
