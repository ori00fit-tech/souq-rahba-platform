import { UI } from "../uiTokens";

const items = [
  "شحن مجاني للطلبات فوق 200 درهم",
  "الدفع عند الاستلام متوفر",
  "بائعون موثوقون من مختلف المدن",
  "متابعة الطلبات بسهولة",
];

export default function HomeCommerceStrip() {
  return (
    <section style={s.wrap} dir="rtl" aria-label="مزايا رحبة">
      <div style={s.track}>
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
    overflow: "hidden",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 42%, #0abfb8 100%)",
    padding: "14px 0",
    boxShadow: "0 18px 42px rgba(11,15,26,0.10)",
  },

  track: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "max-content",
    paddingInline: "16px",
    animation: "rahba-marquee 28s linear infinite",
  },

  item: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "38px",
    padding: "0 14px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: UI.colors.white,
    fontSize: UI.type.bodySm,
    fontWeight: 800,
    whiteSpace: "nowrap",
    backdropFilter: "blur(6px)",
  },

  dot: {
    color: "#F5C855",
    fontWeight: 900,
    fontSize: "13px",
    lineHeight: 1,
  },
};
