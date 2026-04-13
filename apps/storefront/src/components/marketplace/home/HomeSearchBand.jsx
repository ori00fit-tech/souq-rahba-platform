import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomeSearchBand() {
  const quickTags = [
    "هاتف آيفون",
    "حذاء رياضي",
    "طاجين",
    "سماعات",
    "عطر",
    "حقيبة"
  ];

  return (
    <section style={s.wrap} dir="rtl">
      <div style={s.inner}>
        <div style={s.head}>
          <div style={s.badge}>SEARCH FIRST</div>
          <h2 style={s.title}>
            ابحث بسرعة عن
            <span style={s.titleAccent}> المنتج المناسب </span>
            لك
          </h2>
          <p style={s.sub}>
            ابدأ البحث من هنا، تصفح الفئات، وانتقل مباشرة إلى النتائج داخل رحبة
            بطريقة أوضح وأسهل.
          </p>
        </div>

        <div style={s.searchShell}>
          <div style={s.searchTopRow}>
            <input
              style={s.searchInput}
              placeholder="ماذا تبحث عن؟ مثال: هاتف، أحذية، أدوات منزلية..."
            />

            <select style={s.searchSelect} defaultValue="">
              <option value="">كل الفئات</option>
              <option>إلكترونيات</option>
              <option>ملابس</option>
              <option>المنزل</option>
              <option>الرياضة</option>
            </select>

            <Link to="/products" style={s.searchBtn}>
              🔍 بحث
            </Link>
          </div>

          <div style={s.metaRow}>
            <span style={s.metaChip}>نتائج أسرع</span>
            <span style={s.metaChip}>فئات واضحة</span>
            <span style={s.metaChip}>منتجات متنوعة</span>
          </div>
        </div>

        <div style={s.tagsWrap}>
          {quickTags.map((tag) => (
            <Link
              key={tag}
              to={`/products?q=${encodeURIComponent(tag)}`}
              style={s.tag}
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const s = {
  wrap: {
    background: "linear-gradient(135deg, #0f172a 0%, #15243b 55%, #0f172a 100%)",
    borderRadius: UI.radius.hero,
    padding: "28px 18px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 24px 60px rgba(2, 8, 23, 0.24)"
  },

  inner: {
    display: "grid",
    gap: "18px",
    position: "relative",
    zIndex: 1
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

  titleAccent: {
    color: UI.colors.gold
  },

  sub: {
    margin: 0,
    color: "rgba(255,255,255,0.70)",
    fontSize: UI.type.bodySm,
    lineHeight: 1.9,
    maxWidth: "720px",
    marginInline: "auto"
  },

  searchShell: {
    display: "grid",
    gap: "12px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: UI.radius.xxl,
    padding: "12px",
    boxShadow: "0 18px 42px rgba(0,0,0,.22)",
    border: "1px solid rgba(255,255,255,0.2)"
  },

  searchTopRow: {
    display: "grid",
    gap: "8px"
  },

  searchInput: {
    minHeight: "50px",
    border: "none",
    outline: "none",
    padding: "0 14px",
    fontFamily: "inherit",
    fontSize: "15px",
    direction: "rtl",
    color: UI.colors.ink,
    background: "#ffffff",
    borderRadius: UI.radius.md,
    boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.18)"
  },

  searchSelect: {
    minHeight: "46px",
    border: "1px solid #e5e7eb",
    borderRadius: UI.radius.md,
    padding: "0 12px",
    fontFamily: "inherit",
    color: "#555",
    background: "#f8fafc"
  },

  searchBtn: {
    minHeight: "46px",
    borderRadius: UI.radius.md,
    background: "linear-gradient(135deg, #f05a28, #e8a020)",
    color: UI.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 800,
    boxShadow: "0 12px 28px rgba(240,90,40,0.25)"
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center"
  },

  metaChip: {
    padding: "6px 10px",
    borderRadius: UI.radius.pill,
    background: "#f8fafc",
    color: UI.colors.navy,
    border: "1px solid #e5e7eb",
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  tagsWrap: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap"
  },

  tag: {
    padding: "7px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,.10)",
    color: "rgba(255,255,255,.86)",
    border: "1px solid rgba(255,255,255,.14)",
    textDecoration: "none",
    fontSize: UI.type.caption,
    fontWeight: 700
  }
};
