import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";

export default function Footer() {
  return (
    <footer className="container" dir="rtl" style={styles.wrap}>
      <div style={styles.topCard}>
        <div style={styles.brandBlock}>
          <div style={styles.brandRow}>
            <h2 style={styles.brandTitle}>رحبة</h2>
            <div style={styles.brandSub}>RAHBA Marketplace</div>
          </div>

          <p style={styles.brandText}>
            منصة سوق إلكتروني مغربي تجمع بين المشترين والبائعين في تجربة حديثة،
            موثوقة وسهلة الاستخدام.
          </p>

          <div style={styles.badges}>
            <span style={styles.badge}>متعدد الباعة</span>
            <span style={styles.badge}>موثوق</span>
            <span style={styles.badge}>سهل الاستخدام</span>
          </div>
        </div>
      </div>

      <div className="footer-grid" style={styles.grid}>
        <section style={styles.linkCard}>
          <h3 style={styles.title}>للتسوق</h3>
          <nav style={styles.links}>
            <Link to="/" style={styles.link}>الرئيسية</Link>
            <Link to="/products" style={styles.link}>المنتجات</Link>
            <Link to="/sellers" style={styles.link}>الباعة</Link>
            <Link to="/my-orders" style={styles.link}>طلباتي</Link>
          </nav>
        </section>

        <section style={styles.linkCard}>
          <h3 style={styles.title}>للباعة</h3>
          <nav style={styles.links}>
            <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={styles.link}>
              ابدأ البيع
            </a>
            <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={styles.link}>
              بوابة البائع
            </a>
            <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={styles.link}>
              إدارة الطلبات
            </a>
          </nav>
        </section>

        <section style={styles.linkCard}>
          <h3 style={styles.title}>الدعم</h3>
          <nav style={styles.links}>
            <Link to="/help" style={styles.link}>المساعدة</Link>
            <Link to="/about" style={styles.link}>عن رحبة</Link>
            <Link to="/privacy" style={styles.link}>الخصوصية</Link>
            <Link to="/terms" style={styles.link}>الشروط</Link>
          </nav>
        </section>
      </div>

      <div style={styles.bottom}>
        <span>© 2026 رحبة — جميع الحقوق محفوظة</span>
        <span>صُنع في المغرب</span>
        <span>Powered by Cloudflare</span>
      </div>
    </footer>
  );
}

const styles = {
  wrap: {
    paddingTop: "8px",
    paddingBottom: "28px",
    display: "grid",
    gap: "16px"
  },

  topCard: {
    background: "#f8f7f3",
    border: "1.5px solid #ddd5c2",
    borderRadius: "28px",
    padding: "22px 20px",
    boxShadow: "0 8px 24px rgba(22,53,107,0.05)"
  },

  brandBlock: {
    display: "grid",
    gap: "12px",
    textAlign: "right"
  },

  brandRow: {
    display: "grid",
    gap: "4px"
  },

  brandTitle: {
    margin: 0,
    color: "#173b74",
    fontSize: "34px",
    fontWeight: 900,
    lineHeight: 1.1
  },

  brandSub: {
    color: "#138a7a",
    fontSize: "18px",
    fontWeight: 800
  },

  brandText: {
    margin: 0,
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: 1.95
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "flex-start"
  },

  badge: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1.5px solid #ddd5c2",
    background: "#ffffff",
    color: "#173b74",
    fontWeight: 800,
    fontSize: "14px"
  },

  grid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr"
  },

  linkCard: {
    background: "#fdfcf9",
    border: "1.5px solid #ddd5c2",
    borderRadius: "24px",
    padding: "20px",
    display: "grid",
    gap: "14px",
    minHeight: "100%"
  },

  title: {
    margin: 0,
    color: "#173b74",
    fontSize: "18px",
    fontWeight: 900
  },

  links: {
    display: "grid",
    gap: "12px"
  },

  link: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "17px",
    lineHeight: 1.9
  },

  bottom: {
    borderTop: "1px solid #ddd5c2",
    paddingTop: "16px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px 18px",
    color: "#6b7280",
    fontSize: "14px"
  }
};
