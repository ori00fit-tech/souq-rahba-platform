import { UI } from "../uiTokens";

const items = [
  {
    icon: "🚚",
    title: "شحن سريع",
    text: "توصيل أوضح وأسرع لمدن متعددة داخل المغرب"
  },
  {
    icon: "🔒",
    title: "دفع آمن",
    text: "خيارات دفع أسهل وتجربة شراء أكثر ثقة"
  },
  {
    icon: "↩️",
    title: "متابعة الطلب",
    text: "تتبع أوضح لحالة الطلب من الشراء حتى التسليم"
  },
  {
    icon: "🤝",
    title: "باعة موثوقون",
    text: "متاجر وصفحات بيع تساعد على بناء الثقة بسرعة"
  }
];

export default function HomeTrustBar() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.head}>
        <div style={s.badge}>WHY RAHBA</div>
        <h2 style={s.title}>تجربة أوضح وأكثر ثقة للمشتري</h2>
        <p style={s.sub}>
          رحبة مصممة باش تسهّل عليك البحث، الشراء، ومتابعة الطلب في واجهة منظمة
          وباعة أكثر وضوحاً.
        </p>
      </div>

      <div style={s.grid}>
        {items.map((item) => (
          <div key={item.title} style={s.card}>
            <div style={s.iconWrap}>{item.icon}</div>
            <div style={s.cardTitle}>{item.title}</div>
            <div style={s.cardText}>{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  wrap: {
    background: "linear-gradient(135deg, #0f172a 0%, #132238 100%)",
    borderRadius: UI.radius.hero,
    padding: "30px 18px",
    display: "grid",
    gap: "18px",
    boxShadow: "0 24px 60px rgba(2, 8, 23, 0.22)"
  },

  head: {
    display: "grid",
    gap: "10px",
    textAlign: "center"
  },

  badge: {
    width: "fit-content",
    marginInline: "auto",
    padding: "7px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: UI.type.caption,
    fontWeight: 800,
    letterSpacing: "0.05em"
  },

  title: {
    margin: 0,
    color: UI.colors.white,
    fontSize: UI.type.titleMd,
    fontWeight: 900,
    lineHeight: 1.4
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.68)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.9,
    maxWidth: "760px",
    marginInline: "auto"
  },

  grid: {
    display: "grid",
    gap: "14px"
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: UI.radius.xl,
    padding: "18px",
    display: "grid",
    gap: "10px",
    textAlign: "center",
    backdropFilter: "blur(10px)"
  },

  iconWrap: {
    width: "54px",
    height: "54px",
    marginInline: "auto",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.14)",
    fontSize: "28px"
  },

  cardTitle: {
    color: UI.colors.white,
    fontSize: "16px",
    fontWeight: 900
  },

  cardText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.8
  }
};
