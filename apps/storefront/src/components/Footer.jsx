import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";

const T = {
  navy: "#16356b",
  blue: "#1d4ed8",
  teal: "#0f766e",
  gold: "#b08d3c",
  sand: "#f5f1e8",
  border: "#ddd5c2",
  text: "#475569",
  white: "#ffffff",
};

export default function Footer() {
  return (
    <footer style={s.footer} dir="rtl">
      <div style={s.top}>
        <div style={s.brandCol}>
          <div style={s.brandRow}>
            <img
              src="/brand/logo-icon.png"
              alt="RAHBA"
              style={s.logo}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <div style={s.brandTitle}>رحبة</div>
              <div style={s.brandSub}>RAHBA Marketplace</div>
            </div>
          </div>

          <p style={s.brandText}>
            منصة سوق إلكتروني مغربي تجمع بين المشترين والبائعين في تجربة
            حديثة، موثوقة وسهلة الاستخدام.
          </p>

          <div style={s.badges}>
            <span style={s.badge}>متعدد الباعة</span>
            <span style={s.badge}>موثوق</span>
            <span style={s.badge}>سهل الاستخدام</span>
          </div>
        </div>

        <div style={s.linksGrid}>
          <div style={s.col}>
            <h4 style={s.colTitle}>للتسوق</h4>
            <div style={s.linkList}>
              <Link to="/" style={s.link}>الرئيسية</Link>
              <Link to="/products" style={s.link}>المنتجات</Link>
              <Link to="/sellers" style={s.link}>الباعة</Link>
              <Link to="/my-orders" style={s.link}>طلباتي</Link>
            </div>
          </div>

          <div style={s.col}>
            <h4 style={s.colTitle}>للباعة</h4>
            <div style={s.linkList}>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.link}>
                ابدأ البيع
              </a>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.link}>
                بوابة البائع
              </a>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.link}>
                إدارة الطلبات
              </a>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.link}>
                إضافة المنتجات
              </a>
            </div>
          </div>

          <div style={s.col}>
            <h4 style={s.colTitle}>الدعم والقوانين</h4>
            <div style={s.linkList}>
              <Link to="/help" style={s.link}>المساعدة</Link>
              <Link to="/about" style={s.link}>عن رحبة</Link>
              <a href="#" style={s.link}>الخصوصية</a>
              <a href="#" style={s.link}>الشروط</a>
            </div>
          </div>
        </div>
      </div>

      <div style={s.bottom}>
        <div style={s.copy}>© {new Date().getFullYear()} رحبة — جميع الحقوق محفوظة</div>
        <div style={s.meta}>
          <span>صُنع في المغرب</span>
          <span style={s.sep}>•</span>
          <span>Powered by Cloudflare</span>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    marginTop: "40px",
    background: "#fff",
    borderTop: `1px solid ${T.border}`,
    padding: "28px 16px 22px",
  },

  top: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 1.8fr",
    gap: "28px",
  },

  brandCol: {
    display: "grid",
    gap: "14px",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "46px",
    height: "46px",
    objectFit: "contain",
    borderRadius: "12px",
  },

  brandTitle: {
    fontSize: "22px",
    fontWeight: 900,
    color: T.navy,
    lineHeight: 1.1,
  },

  brandSub: {
    fontSize: "12px",
    color: T.teal,
    fontWeight: 700,
    marginTop: "4px",
  },

  brandText: {
    margin: 0,
    color: T.text,
    lineHeight: 1.9,
    fontSize: "14px",
    maxWidth: "420px",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: `1px solid ${T.border}`,
    color: T.navy,
    fontSize: "12px",
    fontWeight: 700,
  },

  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  col: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
  },

  colTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 900,
    color: T.navy,
  },

  linkList: {
    display: "grid",
    gap: "10px",
  },

  link: {
    textDecoration: "none",
    color: T.text,
    fontSize: "14px",
    lineHeight: 1.7,
  },

  bottom: {
    maxWidth: "1200px",
    margin: "22px auto 0",
    paddingTop: "16px",
    borderTop: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  copy: {
    color: "#64748b",
    fontSize: "13px",
  },

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "13px",
    flexWrap: "wrap",
  },

  sep: {
    opacity: 0.5,
  },
};
