import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";

const T = {
  navy: "#16356b",
  teal: "#0f766e",
  sand: "#f5f1e8",
  border: "#ddd5c2",
  text: "#475569",
  white: "#ffffff",
  soft: "#f8fafc",
};

export default function Footer() {
  return (
    <footer style={s.footer} dir="rtl">
      <div style={s.wrap}>
        <div style={s.top}>
          <div style={s.brandCard}>
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

          <div style={s.linksArea}>
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
              </div>
            </div>

            <div style={s.col}>
              <h4 style={s.colTitle}>الدعم</h4>
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
      </div>
    </footer>
  );
}

const s = {
  footer: {
    marginTop: "36px",
    background: "#fff",
    borderTop: `1px solid ${T.border}`,
    padding: "20px 14px 18px",
  },

  wrap: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "18px",
  },

  top: {
    display: "grid",
    gap: "18px",
  },

  brandCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "12px",
    boxShadow: "0 4px 16px rgba(22,53,107,0.05)",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    borderRadius: "12px",
  },

  brandTitle: {
    fontSize: "24px",
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
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: T.soft,
    border: `1px solid ${T.border}`,
    color: T.navy,
    fontSize: "12px",
    fontWeight: 700,
  },

  linksArea: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  col: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "10px",
    boxShadow: "0 4px 16px rgba(22,53,107,0.04)",
  },

  colTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 900,
    color: T.navy,
  },

  linkList: {
    display: "grid",
    gap: "8px",
  },

  link: {
    textDecoration: "none",
    color: T.text,
    fontSize: "14px",
    lineHeight: 1.7,
  },

  bottom: {
    borderTop: `1px solid ${T.border}`,
    paddingTop: "14px",
    display: "grid",
    gap: "6px",
    textAlign: "center",
  },

  copy: {
    color: "#64748b",
    fontSize: "13px",
  },

  meta: {
    display: "flex",
    justifyContent: "center",
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
