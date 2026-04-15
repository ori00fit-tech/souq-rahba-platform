import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";

export default function Footer() {
  return (
    <footer className="container" dir="rtl" style={styles.wrap}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlow} />

        <div style={styles.heroContent}>
          <div style={styles.brandBlock}>
            <div style={styles.brandBadge}>منصة سوق إلكتروني مغربي حديث</div>

            <div style={styles.brandRow}>
              <h2 style={styles.brandTitle}>رحبة</h2>
              <div style={styles.brandSub}>RAHBA Marketplace</div>
            </div>

            <p style={styles.brandText}>
              رحبة منصة تجمع المشترين والبائعين في تجربة سوق إلكتروني حديثة،
              موثوقة، وسهلة التصفح، مع تركيز على الوضوح، الثقة، وسهولة البيع
              والشراء داخل المغرب.
            </p>

            <div style={styles.badges}>
              <span style={styles.badge}>متعدد الباعة</span>
              <span style={styles.badge}>دفع عند الاستلام</span>
              <span style={styles.badge}>تجربة عربية واضحة</span>
              <span style={styles.badge}>جاهز للنمو</span>
            </div>
          </div>

          <div style={styles.ctaPanel}>
            <div style={styles.ctaTitle}>ابدأ البيع على رحبة</div>
            <p style={styles.ctaText}>
              افتح متجرك، اعرض منتجاتك، وابدأ الوصول إلى مشترين من مدن مختلفة
              داخل المغرب عبر تجربة احترافية وسهلة.
            </p>

            <a
              href={SELLER_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              style={styles.ctaButton}
            >
              الدخول إلى بوابة البائع
            </a>
          </div>
        </div>
      </section>

      <div className="footer-grid" style={styles.grid}>
        <section style={styles.linkCard}>
          <h3 style={styles.title}>للتسوق</h3>
          <nav style={styles.links}>
            <Link to="/" style={styles.link}>
              الرئيسية
            </Link>
            <Link to="/products" style={styles.link}>
              المنتجات
            </Link>
            <Link to="/sellers" style={styles.link}>
              الباعة
            </Link>
            <Link to="/my-orders" style={styles.link}>
              طلباتي
            </Link>
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
            <Link to="/help" style={styles.link}>
              المساعدة
            </Link>
            <Link to="/about" style={styles.link}>
              عن رحبة
            </Link>
            <Link to="/privacy" style={styles.link}>
              الخصوصية
            </Link>
            <Link to="/terms" style={styles.link}>
              الشروط
            </Link>
          </nav>
        </section>

        <section style={styles.linkCard}>
          <h3 style={styles.title}>الثقة والخدمة</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoDot} />
              <span>عرض أوضح للمنتجات والبائعين</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoDot} />
              <span>تجربة مناسبة للهاتف أولاً</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoDot} />
              <span>واجهة مبنية للنمو والثقة</span>
            </div>
          </div>
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
    paddingTop: "10px",
    paddingBottom: "30px",
    display: "grid",
    gap: "18px",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 42%, #0abfb8 100%)",
    borderRadius: "30px",
    padding: "24px 20px",
    boxShadow: "0 20px 50px rgba(11,15,26,0.14)",
    color: "#fff",
  },

  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 40%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "18px",
  },

  brandBlock: {
    display: "grid",
    gap: "12px",
    textAlign: "right",
  },

  brandBadge: {
    width: "fit-content",
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "12px",
  },

  brandRow: {
    display: "grid",
    gap: "4px",
  },

  brandTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: 900,
    lineHeight: 1.1,
  },

  brandSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "18px",
    fontWeight: 800,
  },

  brandText: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "15px",
    lineHeight: 1.95,
    maxWidth: "760px",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "flex-start",
  },

  badge: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "13px",
    backdropFilter: "blur(8px)",
  },

  ctaPanel: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "22px",
    padding: "18px",
    display: "grid",
    gap: "10px",
    backdropFilter: "blur(10px)",
  },

  ctaTitle: {
    color: "#fff",
    fontSize: "19px",
    fontWeight: 900,
  },

  ctaText: {
    margin: 0,
    color: "rgba(255,255,255,0.86)",
    fontSize: "14px",
    lineHeight: 1.9,
  },

  ctaButton: {
    width: "fit-content",
    minHeight: "46px",
    padding: "0 16px",
    borderRadius: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    background: "#ffffff",
    color: "#0d2c54",
    fontWeight: 900,
    boxShadow: "0 10px 24px rgba(11,15,26,0.12)",
  },

  grid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "1fr",
  },

  linkCard: {
    background: "#fdfcf9",
    border: "1.5px solid #e2d8ca",
    borderRadius: "24px",
    padding: "20px",
    display: "grid",
    gap: "14px",
    minHeight: "100%",
    boxShadow: "0 8px 22px rgba(11,15,26,0.04)",
  },

  title: {
    margin: 0,
    color: "#0d2c54",
    fontSize: "18px",
    fontWeight: 900,
  },

  links: {
    display: "grid",
    gap: "12px",
  },

  link: {
    textDecoration: "none",
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.9,
    fontWeight: 700,
  },

  infoList: {
    display: "grid",
    gap: "12px",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.8,
    fontWeight: 700,
  },

  infoDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    flexShrink: 0,
    background: "linear-gradient(135deg, #0abfb8 0%, #3ba5f5 100%)",
  },

  bottom: {
    borderTop: "1px solid #ddd5c2",
    paddingTop: "16px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px 18px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: 600,
  },
};
