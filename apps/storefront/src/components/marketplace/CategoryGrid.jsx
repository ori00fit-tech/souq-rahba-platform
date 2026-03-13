import { Link } from "react-router-dom";

const T = {
  navy: "#16356b",
  blue: "#1d4ed8",
  teal: "#0f766e",
  sand: "#f5f1e8",
  border: "#ddd5c2",
  shadow: "rgba(22,53,107,0.08)",
};

const categories = [
  { name: "الإلكترونيات", icon: "📱", text: "هواتف، أجهزة وملحقات رقمية", slug: "electronics" },
  { name: "الأزياء", icon: "👕", text: "ملابس، أحذية وإكسسوارات", slug: "fashion" },
  { name: "المنزل", icon: "🏠", text: "أثاث، ديكور ولوازم منزلية", slug: "home" },
  { name: "الجمال", icon: "💄", text: "عناية، مستحضرات وتجميل", slug: "beauty" },
  { name: "الرياضة", icon: "🏃", text: "معدات رياضية ولياقة", slug: "sports" },
  { name: "الأدوات", icon: "🛠️", text: "معدات العمل والـ DIY", slug: "tools" },
  { name: "السيارات", icon: "🚗", text: "إكسسوارات وصيانة السيارات", slug: "automotive" },
  { name: "الحديقة", icon: "🌿", text: "مستلزمات الزراعة والخارج", slug: "garden" },
];

export default function CategoryGrid() {
  return (
    <section style={s.section} dir="rtl">
      <SectionHead
        title="تصفح الفئات"
        sub="ابدأ استكشاف السوق من خلال الفئات الرئيسية للمنتجات"
      />

      <div style={s.grid}>
        {categories.map((cat) => (
          <Link key={cat.name} to={`/products?category=${cat.slug}`} style={s.card}>
            <div style={s.iconWrap}>
              <span style={s.icon}>{cat.icon}</span>
            </div>

            <div style={s.content}>
              <div style={s.cardTitle}>{cat.name}</div>
              <div style={s.cardText}>{cat.text}</div>
            </div>
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
    gap: "18px",
  },

  head: {
    display: "grid",
    gap: "6px",
    textAlign: "right",
  },

  headTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 900,
    color: T.navy,
  },

  headSub: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
    gap: "12px",
  },

  card: {
    textDecoration: "none",
    background: "#fff",
    border: `1.5px solid ${T.border}`,
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: `0 4px 16px ${T.shadow}`,
    cursor: "pointer",
    textAlign: "right",
  },

  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: T.sand,
    border: `1px solid ${T.border}`,
    display: "grid",
    placeItems: "center",
    justifySelf: "start",
  },

  icon: {
    fontSize: "24px",
    lineHeight: 1,
  },

  content: {
    display: "grid",
    gap: "4px",
  },

  cardTitle: {
    fontSize: "15px",
    fontWeight: 800,
    color: T.navy,
    marginBottom: "2px",
  },

  cardText: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.7,
  },
};
