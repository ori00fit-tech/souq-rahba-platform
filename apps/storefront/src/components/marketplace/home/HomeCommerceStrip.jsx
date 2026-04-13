import { UI } from "../uiTokens";

const items = [
  "شحن مجاني للطلبات فوق 200 درهم",
  "الدفع عند الاستلام متوفر",
  "بائعون موثوقون من مختلف المدن",
  "متابعة الطلبات بسهولة"
];

export default function HomeCommerceStrip() {
  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.inner}>
        {[...items, ...items].map((item, index) => (
          <div key={`${item}-${index}`} style={s.item}>
            <span style={s.dot}>✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const s = {
  wrap: {
    background: "linear-gradient(135deg, #0f172a 0%, #132238 100%)",
    borderRadius: UI.radius.xl,
    overflow: "hidden",
    padding: "14px 0",
    boxShadow: "0 18px 42px rgba(2, 8, 23, 0.16)"
  },

  inner: {
    display: "flex",
    gap: "24px",
    overflowX: "auto",
    padding: "0 18px",
    alignItems: "center"
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255,255,255,.86)",
    whiteSpace: "nowrap",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  dot: {
    color: UI.colors.gold,
    fontSize: UI.type.caption
  }
};
