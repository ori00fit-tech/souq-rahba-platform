import { UI } from "../uiTokens";

const items = [
  {
    title: "باعة موثوقون",
    text: "عرض أوضح لهوية البائع والثقة في المتجر",
    icon: "🛍️",
  },
  {
    title: "تصفح أسهل",
    text: "وصول أسرع للمنتجات والفئات المناسبة",
    icon: "⚡",
  },
  {
    title: "تجربة حديثة",
    text: "واجهة منظمة ومريحة للهاتف أولاً",
    icon: "📱",
  },
  {
    title: "شراء بثقة",
    text: "معلومات أوضح قبل اتخاذ قرار الشراء",
    icon: "✅",
  },
];

export default function HomeTrustBar() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.head}>
        <div style={s.badge}>WHY RAHBA</div>
        <h2 style={s.title}>تجربة مبنية على الثقة والوضوح وسهولة الوصول</h2>
        <p style={s.sub}>
          رحبة ليست فقط واجهة جميلة، بل تجربة سوق حديثة تساعد المستخدم يلقى
          المنتج المناسب بسرعة، ويتعامل مع باعة بشكل أوضح وأكثر ثقة.
        </p>
      </div>

      <div style={s.grid}>
        {items.map((item) => (
          <article key={item.title} style={s.card}>
            <div style={s.iconBox}>{item.icon}</div>

            <div style={s.content}>
              <h3 style={s.cardTitle}>{item.title}</h3>
              <p style={s.cardText}>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const s = {
  wrap: {
    display: "grid",
    gap: "16px",
    background: "linear-gradient(135deg, #fffdfa 0%, #f8f3ea 100%)",
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.hero,
    padding: "24px 18px",
    boxShadow: "0 18px 42px rgba(11,15,26,0.06)",
  },

  head: {
    display: "grid",
    gap: "10px",
    textAlign: "center",
  },

  badge: {
    width: "fit-content",
    marginInline: "auto",
    padding: "7px 12px",
    borderRadius: UI.radius.pill,
    background: UI.colors.softBlue,
    color: UI.colors.navy,
    border: "1px solid #dbeafe",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },

  title: {
    margin: 0,
    color: UI.colors.ink,
    fontSize: UI.type.titleMd,
    lineHeight: 1.4,
    fontWeight: 900,
  },

  sub: {
    margin: 0,
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    lineHeight: 1.9,
    maxWidth: "760px",
    marginInline: "auto",
  },

  grid: {
    display: "grid",
    gap: "12px",
  },

  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    borderRadius: UI.radius.xl,
    background: "#ffffff",
    border: `1px solid ${UI.colors.border}`,
    boxShadow: "0 8px 20px rgba(11,15,26,0.04)",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    fontSize: "22px",
    background: "linear-gradient(135deg, #eef6ff 0%, #eafbf7 100%)",
    border: "1px solid #d9ebe8",
  },

  content: {
    display: "grid",
    gap: "4px",
  },

  cardTitle: {
    margin: 0,
    color: UI.colors.ink,
    fontSize: "16px",
    lineHeight: 1.5,
    fontWeight: 900,
  },

  cardText: {
    margin: 0,
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    lineHeight: 1.85,
  },
};
