import SectionHead from "./SectionHead";

const T = {
  navy: "#16356b",
  ink: "#243041",
  muted: "#64748b",
  border: "#ddd5c2",
  line: "#e8dfd0",
  white: "#ffffff",
  shadow: "rgba(22,53,107,0.08)"
};

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
    <section className="ui-card" style={s.section} dir="rtl">
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
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gap: "18px",
    padding: "18px",
    background: T.white,
    border: `1px solid ${T.line}`,
    boxShadow: `0 8px 24px ${T.shadow}`
  },

  headWrap: {
    display: "grid",
    gap: "10px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px"
  },

  card: {
    padding: "16px",
    display: "grid",
    gap: "14px",
    border: `1px solid ${T.line}`,
    background: "#fffdfa",
    textAlign: "right",
    borderRadius: "18px"
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
    borderRadius: "999px",
    background: "#eef2f7",
    marginTop: "8px"
  },

  content: {
    display: "grid",
    gap: "6px"
  },

  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
    lineHeight: 1.4
  },

  text: {
    margin: 0,
    color: T.muted,
    fontSize: "13px",
    lineHeight: 1.9
  },

  bottomStrip: {
    padding: "16px",
    display: "grid",
    gap: "6px",
    borderRadius: "16px",
    border: `1px solid ${T.line}`,
    background: "#f8fafc"
  },

  bottomStripTitle: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "15px"
  },

  bottomStripText: {
    color: T.muted,
    lineHeight: 1.9,
    fontSize: "13px"
  }
};
