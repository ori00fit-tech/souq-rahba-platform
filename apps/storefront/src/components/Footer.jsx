import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";

export default function Footer() {
  return (
    <footer className="container" dir="rtl" style={styles.wrap}>
      <div className="footer-grid" style={styles.grid}>
        <section className="ui-card" style={styles.card}>
          <h3 style={styles.title}>رحبة</h3>
          <p style={styles.text}>
            منصة سوق إلكتروني مغربي تجمع بين المشترين والبائعين في تجربة حديثة، موثوقة وسهلة الاستخدام.
          </p>

          <div style={styles.badges}>
            <span style={styles.badge}>متعدد الباعة</span>
            <span style={styles.badge}>موثوق</span>
            <span style={styles.badge}>سهل الاستخدام</span>
          </div>
        </section>

        <section className="ui-card" style={styles.card}>
          <h3 style={styles.title}>للتسوق</h3>
          <nav style={styles.links}>
            <Link to="/" style={styles.link}>الرئيسية</Link>
            <Link to="/products" style={styles.link}>المنتجات</Link>
            <Link to="/sellers" style={styles.link}>الباعة</Link>
            <Link to="/my-orders" style={styles.link}>طلباتي</Link>
          </nav>
        </section>

        <section className="ui-card" style={styles.card}>
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

        <section className="ui-card" style={styles.card}>
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
    paddingBottom: "28px",
    display: "grid",
    gap: "18px"
  },
  grid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr"
  },
  card: {
    display: "grid",
    gap: "12px",
    padding: "20px",
    height: "100%"
  },
  title: {
    margin: 0,
    color: "#173b74",
    fontSize: "18px",
    fontWeight: 900
  },
  text: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.9,
    fontSize: "15px"
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #ddd5c2",
    background: "#fcfbf7",
    color: "#173b74",
    fontWeight: 800,
    fontSize: "13px"
  },
  links: {
    display: "grid",
    gap: "10px"
  },
  link: {
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: 1.8
  },
  bottom: {
    borderTop: "1px solid #ddd5c2",
    paddingTop: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px 18px",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "14px"
  }
};
