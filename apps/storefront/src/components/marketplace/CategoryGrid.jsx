import { Link } from "react-router-dom";

const T = {
  navy: "#16356b",
  blue: "#1d4ed8",
  teal: "#0f766e",
  sand: "#f5f1e8",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)",
  text: "#64748b"
};

const fallbackIcons = {
  electronics: "تقنية",
  appliances: "منزل",
  tools: "أدوات",
  agriculture: "فلاحة",
  fishing: "بحر",
  construction: "ورش",
  fashion: "أزياء",
  food: "غذاء",
  home: "منزل",
  beauty: "عناية",
  sports: "رياضة",
  automotive: "سيارات",
  garden: "حديقة"
};

export default function CategoryGrid({ categories = [] }) {
  const items = categories.map((cat, index) => ({
    ...cat,
    icon: fallbackIcons[cat.slug] || "منتجات",
    text: `استكشف ${cat.name_ar} من باعة مختلفين داخل رحبة`,
    featured: index < 2
  }));

  return (
    <section style={s.section} dir="rtl">
      <SectionHead
        title="تصفح الفئات"
        sub="ابدأ استكشاف السوق من خلال الفئات الرئيسية الأكثر حضورًا داخل المنصة"
      />

      <div style={s.grid}>
        {items.map((cat) => (
          <Link
            key={cat.id || cat.slug}
            to={`/products?category=${cat.slug}`}
            style={{
              ...s.card,
              ...(cat.featured ? s.cardFeatured : {})
            }}
          >
            <div style={s.topRow}>
              <div
                style={{
                  ...s.iconWrap,
                  ...(cat.featured ? s.iconWrapFeatured : {})
                }}
              >
                <span style={s.icon}>{cat.icon}</span>
              </div>

              {cat.featured ? <span style={s.badge}>مقترحة</span> : null}
            </div>

            <div style={s.content}>
              <div style={s.cardTitle}>{cat.name_ar}</div>
              <div style={s.cardText}>{cat.text}</div>
            </div>

            <div style={s.footer}>عرض المنتجات ←</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SectionHead({ title, sub }) {
  return (
    <div style={s.head} dir="rtl">
      <h2 style={s.headTitle}>{title}</h2>
      {sub ? <p style={s.headSub}>{sub}</p> : null}
    </div>
  );
}

const s = {
  section: {
    display: "grid",
    gap: "18px"
  },

  head: {
    display: "grid",
    gap: "6px",
    textAlign: "right"
  },

  headTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 900,
    color: T.navy
  },

  headSub: {
    margin: 0,
    color: T.text,
    fontSize: "14px",
    lineHeight: 1.8,
    maxWidth: "760px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "14px"
  },

  card: {
    textDecoration: "none",
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "22px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    boxShadow: `0 6px 18px ${T.shadow}`,
    cursor: "pointer",
    textAlign: "right",
    minHeight: "170px"
  },

  cardFeatured: {
    background:
      "linear-gradient(180deg, rgba(240,246,255,0.9) 0%, rgba(255,255,255,1) 100%)"
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },

  iconWrap: {
    minWidth: "56px",
    height: "56px",
    padding: "0 14px",
    borderRadius: "16px",
    background: T.sand,
    border: `1px solid ${T.border}`,
    display: "grid",
    placeItems: "center"
  },

  iconWrapFeatured: {
    background: "#eef4ff",
    border: "1px solid #c7d7f8"
  },

  icon: {
    fontSize: "13px",
    fontWeight: 900,
    color: T.navy
  },

  badge: {
    fontSize: "11px",
    fontWeight: 900,
    color: T.blue,
    background: "#eef4ff",
    border: "1px solid #c7d7f8",
    borderRadius: "999px",
    padding: "6px 10px"
  },

  content: {
    display: "grid",
    gap: "6px"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: 900,
    color: T.navy
  },

  cardText: {
    fontSize: "13px",
    color: T.text,
    lineHeight: 1.8
  },

  footer: {
    marginTop: "auto",
    fontSize: "13px",
    fontWeight: 800,
    color: T.blue
  }
};
