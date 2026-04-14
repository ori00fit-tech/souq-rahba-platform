import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import { UI } from "./uiTokens";

const items = [
  {
    icon: CashIcon,
    title: "الدفع عند الاستلام",
    text: "اطلب بسهولة وادفع عند استلام طلبك حسب توفر الخدمة."
  },
  {
    icon: TruckIcon,
    title: "توصيل سريع",
    text: "شحن لجميع المدن المغربية مع تتبع واضح للطلب."
  },
  {
    icon: ShieldIcon,
    title: "تجربة آمنة",
    text: "معلومات واضحة عن المنتج والبائع قبل الشراء."
  },
  {
    icon: StoreIcon,
    title: "باعة موثوقون",
    text: "متاجر مغربية حقيقية مع صفحات وتقييمات واضحة."
  }
];

export default function TrustSection() {
  return (
    <SectionShell>
      <SectionHead
        chip="WHY RAHBA"
        title="لماذا رحبة؟"
        subtitle="تجربة شراء مغربية أكثر وضوحاً وثقة"
      />

      <div style={s.grid}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} style={s.card}>
              <div style={s.iconWrap}>
                <Icon />
              </div>
              <div style={s.content}>
                <h3 style={s.title}>{item.title}</h3>
                <p style={s.text}>{item.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

// Icons
function CashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5" cy="11" r="1" fill="currentColor" />
      <circle cx="17" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M2 5h11v10H2zM13 8h4l3 3v4h-7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 5.5v5.5c0 4.5 3.5 7.5 8 9 4.5-1.5 8-4.5 8-9V5.5L11 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 8l1.5-5h13L19 8M3 8v10a1 1 0 001 1h14a1 1 0 001-1V8M3 8h16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 19v-6h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const s = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: UI.spacing.md
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    background: UI.colors.bgElevated,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md
  },
  iconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.sm,
    background: UI.colors.tealMuted,
    color: UI.colors.teal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 600,
    color: UI.colors.text
  },
  text: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.6,
    color: UI.colors.textMuted
  }
};
