import { useNavigate } from "react-router-dom";
import SectionHead from "./SectionHead";

function normalizeCategory(category) {
  return {
    id: category?.id || "",
    slug: category?.slug || "",
    name: category?.name || category?.name_ar || "فئة",
    description:
      category?.description ||
      category?.description_ar ||
      "تصفح المنتجات داخل هذه الفئة",
    icon: category?.icon || "📦"
  };
}

export default function CategoryGrid({ categories = [] }) {
  const navigate = useNavigate();

  const items = categories.map(normalizeCategory);

  if (!items.length) return null;

  return (
    <section className="ui-card" style={styles.wrapper}>
      <SectionHead
        chip="CATEGORIES"
        title="تصفح حسب الفئة"
        subtitle="اختار الفئة المناسبة وابدأ رحلة البحث بسرعة"
      />

      <div style={styles.grid}>
        {items.map((cat) => (
          <button
            key={cat.id || cat.slug}
            onClick={() =>
              navigate(`/products?category=${encodeURIComponent(cat.slug)}`)
            }
            style={styles.card}
          >
            <div style={styles.iconWrap}>
              <span style={styles.icon}>{cat.icon}</span>
            </div>

            <div style={styles.body}>
              <div style={styles.name}>{cat.name}</div>
              <div style={styles.desc}>{cat.description}</div>
            </div>

            <div style={styles.arrow}>←</div>
          </button>
        ))}
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    padding: "18px",
    display: "grid",
    gap: "16px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px"
  },

  card: {
    display: "grid",
    gap: "10px",
    padding: "14px",
    borderRadius: "18px",
    border: "1px solid #e7ddcf",
    background: "#fff",
    textAlign: "right",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative"
  },

  iconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eef6ff",
    display: "grid",
    placeItems: "center"
  },

  icon: {
    fontSize: "20px"
  },

  body: {
    display: "grid",
    gap: "4px"
  },

  name: {
    fontWeight: 900,
    color: "#1f2937",
    fontSize: "15px"
  },

  desc: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.6
  },

  arrow: {
    position: "absolute",
    left: "10px",
    bottom: "10px",
    fontSize: "14px",
    color: "#94a3b8"
  }
};
