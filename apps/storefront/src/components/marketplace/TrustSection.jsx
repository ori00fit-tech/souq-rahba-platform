import { SectionHead } from "./CategoryGrid";

const T = {
  navy: "#16356b",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)"
};

const items = [
  {
    title: "تجربة شراء أوضح",
    text: "تنظيم أفضل للمنتجات، صفحات أدق، ومسار واضح من التصفح إلى الطلب.",
    accent: "#1d4ed8",
    bg: "#eff6ff",
    bdr: "#bfdbfe",
    label: "واجهة أوضح"
  },
  {
    title: "باعة وحسابات موثوقة",
    text: "إبراز المتاجر الموثقة داخل السوق لتسهيل اتخاذ القرار وبناء الثقة.",
    accent: "#16a34a",
    bg: "#f0fdf4",
    bdr: "#bbf7d0",
    label: "ثقة أكبر"
  },
  {
    title: "وصول أسرع للمنتجات",
    text: "فئات، منتجات، وصفحات باعة مترابطة بشكل أفضل داخل تجربة موحدة.",
    accent: "#0f766e",
    bg: "#f0fdfa",
    bdr: "#99f6e4",
    label: "تصفح أسرع"
  },
  {
    title: "جاهزية للنمو",
    text: "بنية مناسبة للتوسع مع المزيد من المنتجات والبائعين ومسارات الطلب.",
    accent: "#b45309",
    bg: "#fff7ed",
    bdr: "#fed7aa",
    label: "قابلية توسع"
  }
];

export default function TrustSection() {
  return (
    <section style={s.section} dir="rtl">
      <div style={s.topWrap}>
        <SectionHead
          title="لماذا رحبة؟"
          sub="منصة مصممة لتمنح المشترين والبائعين تجربة أكثر وضوحًا وثقة داخل سوق مغربي حديث."
        />

        <div style={s.topCard}>
          <div style={s.topCardLabel}>RAHBA TRUST</div>
          <div style={s.topCardText}>
            تجربة منظمة، واجهة أوضح، وبنية أقرب لمنصة تجارة حقيقية قابلة للتوسع.
          </div>
        </div>
      </div>

      <div style={s.grid}>
        {items.map((item) => (
          <article key={item.title} style={s.card}>
            <div style={s.cardTop}>
              <span
                style={{
                  ...s.label,
                  color: item.accent,
                  background: item.bg,
                  border: `1px solid ${item.bdr}`
                }}
              >
                {item.label}
              </span>
            </div>

            <div style={s.content}>
              <h3 style={{ ...s.title, color: item.accent }}>{item.title}</h3>
              <p style={s.text}>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const s = {
  section: {
    display: "grid",
    gap: "18px"
  },

  topWrap: {
    display: "grid",
    gap: "14px"
  },

  topCard: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "8px",
    boxShadow: `0 6px 18px ${T.shadow}`
  },

  topCardLabel: {
    fontSize: "12px",
    fontWeight: 900,
    color: "#1d4ed8"
  },

  topCardText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.8
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px"
  },

  card: {
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    boxShadow: `0 6px 18px ${T.shadow}`,
    textAlign: "right"
  },

  cardTop: {
    display: "flex",
    justifyContent: "flex-start"
  },

  label: {
    fontSize: "11px",
    fontWeight: 900,
    borderRadius: "999px",
    padding: "6px 10px"
  },

  content: {
    display: "grid",
    gap: "8px"
  },

  title: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 900
  },

  text: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.8
  }
};
