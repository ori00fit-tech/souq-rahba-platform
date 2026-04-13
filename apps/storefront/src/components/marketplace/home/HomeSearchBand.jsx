import { Link } from "react-router-dom";
import { UI } from "../uiTokens";

export default function HomeSearchBand() {
  return (
    <section style={s.searchBand}>
      <div style={s.searchInner}>
        <div style={s.searchTitle}>
          ابحث عن <em style={s.searchEm}>أي شيء</em> تريده
        </div>

        <div style={s.searchBarShell}>
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

        <div style={s.searchTags}>
          {["هاتف آيفون", "حذاء رياضي", "طاجين", "سماعات", "عطر", "حقيبة"].map((tag) => (
            <Link key={tag} to={`/products?q=${encodeURIComponent(tag)}`} style={s.searchTag}>
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const s = {
  searchBand: {
    background: UI.colors.ink,
    borderRadius: UI.radius.hero,
    padding: "24px 18px",
    overflow: "hidden"
  },

  searchInner: {
    display: "grid",
    gap: "14px"
  },

  searchTitle: {
    textAlign: "center",
    color: UI.colors.white,
    fontSize: UI.type.titleMd,
    fontWeight: 900
  },

  searchEm: {
    color: UI.colors.gold,
    fontStyle: "normal"
  },

  searchBarShell: {
    display: "grid",
    gap: "8px",
    background: UI.colors.white,
    borderRadius: UI.radius.xl,
    padding: "8px",
    boxShadow: "0 18px 42px rgba(0,0,0,.22)"
  },

  searchInput: {
    minHeight: "48px",
    border: "none",
    outline: "none",
    padding: "0 14px",
    fontFamily: "inherit",
    fontSize: "15px",
    direction: "rtl",
    color: UI.colors.ink,
    background: "transparent"
  },

  searchSelect: {
    minHeight: "44px",
    border: "1px solid #eee",
    borderRadius: UI.radius.md,
    padding: "0 12px",
    fontFamily: "inherit",
    color: "#555",
    background: "#F8F8F8"
  },

  searchBtn: {
    minHeight: "44px",
    borderRadius: UI.radius.md,
    background: UI.colors.coral,
    color: UI.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 800
  },

  searchTags: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap"
  },

  searchTag: {
    padding: "6px 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.82)",
    border: "1px solid rgba(255,255,255,.14)",
    textDecoration: "none",
    fontSize: UI.type.caption,
    fontWeight: 700
  }
};
