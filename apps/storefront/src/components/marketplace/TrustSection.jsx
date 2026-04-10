import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import { UI } from "./uiTokens";

const items = [
  {
    icon: "💵",
    title: "الدفع عند الاستلام",
    text: "اطلب بسهولة وخلّص عند الاستلام حسب توفر الخدمة عند البائع.",
    accent: "#166534",
    bg: "#ecfdf5",
    bdr: "#a7f3d0"
  },
  {
    icon: "🚚",
    title: "توصيل حسب المدينة",
    text: "خيارات شحن أوضح وتجربة شراء أقرب لطريقة السوق المغربي الحقيقية.",
    accent: "#1d4ed8",
    bg: "#eff6ff",
    bdr: "#bfdbfe"
  },
  {
    icon: "🔒",
    title: "تجربة طلب أوضح",
    text: "تتبع أسهل للطلبات، ومعطيات أوضح للمشتري قبل اتخاذ قرار الشراء.",
    accent: "#0f766e",
    bg: "#f0fdfa",
    bdr: "#99f6e4"
  },
  {
    icon: "✅",
    title: "باعة داخل رحبة",
    text: "عرض أوضح للبائعين والمتاجر مع صفحات تساعد على بناء الثقة داخل المنصة.",
    accent: "#92400e",
    bg: "#fffbeb",
    bdr: "#fde68a"
  }
];

export default function TrustSection() {
  return (
    <SectionShell>
      <div style={s.headWrap}>
        <SectionHead
          chip="WHY RAHBA"
          title="لماذا رحبة؟"
          subtitle="رحبة تبني تجربة شراء مغربية أكثر وضوحًا: السعر، البائع، التوصيل، والثقة في مكان واحد."
        />
      </div>

      <div style={s.grid}>
        {items.map((item) => (
          <article key={item.title} className="ui-card-soft" style={s.card}>
            <div style={s.cardTop}>
              <div
                style={{
                  ...s.iconWrap,
                  background: item.bg,
                  border: `1px solid ${item.bdr}`
                }}
              >
                <span style={s.icon}>{item.icon}</span>
              </div>

              <div style={s.topAccent} />
            </div>

            <div style={s.content}>
              <h3 style={{ ...s.title, color: item.accent }}>{item.title}</h3>
              <p style={s.text}>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="ui-card-soft" style={s.bottomStrip}>
        <div style={s.bottomStripTitle}>الثقة ليست رسالة تسويقية فقط</div>
        <div style={s.bottomStripText}>
          لهذا نركز في رحبة على إظهار البائع، توضيح حالة المنتج، وتسهيل الشراء والمتابعة
          بطريقة مفهومة للمستخدم المغربي.
        </div>
      </div>
    </SectionShell>
  );
}

const s = {
  headWrap: {
    display: "grid",
    gap: "10px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: UI.spacing.cardGap
  },

  card: {
    padding: UI.spacing.cardPadding,
    display: "grid",
    gap: UI.spacing.cardGap,
    border: `1px solid ${UI.colors.line}`,
    background: UI.colors.softBg,
    textAlign: "right",
    borderRadius: UI.radius.xl
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px"
  },

  iconWrap: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0
  },

  icon: {
    fontSize: "22px",
    lineHeight: 1
  },

  topAccent: {
    width: "44px",
    height: "6px",
    borderRadius: UI.radius.pill,
    background: "#eef2f7",
    marginTop: "8px"
  },

  content: {
    display: "grid",
    gap: "6px"
  },

  title: {
    margin: 0,
    fontSize: UI.type.titleSm,
    fontWeight: 900,
    lineHeight: 1.4
  },

  text: {
    margin: 0,
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    lineHeight: 1.9
  },

  bottomStrip: {
    padding: "16px",
    display: "grid",
    gap: "6px",
    borderRadius: UI.radius.lg,
    border: `1px solid ${UI.colors.line}`,
    background: "#f8fafc"
  },

  bottomStripTitle: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "15px"
  },

  bottomStripText: {
    color: UI.colors.muted,
    lineHeight: 1.9,
    fontSize: UI.type.bodySm
  }
};
