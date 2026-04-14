import { Link } from "react-router-dom";
import { SELLER_PORTAL_URL } from "../lib/config";
import { UI } from "./marketplace/uiTokens";

export default function Footer() {
  return (
    <footer style={s.footer} dir="rtl">
      <div className="container" style={s.container}>
        {/* Brand Section */}
        <div style={s.brand}>
          <div style={s.brandTop}>
            <div style={s.logoMark}>
              <span style={s.logoLetter}>R</span>
            </div>
            <div>
              <div style={s.logoName}>RAHBA</div>
              <div style={s.logoTag}>السوق الموثوق</div>
            </div>
          </div>
          <p style={s.brandDesc}>
            منصة سوق إلكتروني مغربي تجمع بين المشترين والبائعين في تجربة موثوقة وآمنة.
          </p>
          <div style={s.trustBadges}>
            <span style={s.trustBadge}>
              <ShieldIcon /> دفع آمن
            </span>
            <span style={s.trustBadge}>
              <CheckIcon /> باعة موثوقون
            </span>
            <span style={s.trustBadge}>
              <TruckIcon /> توصيل سريع
            </span>
          </div>
        </div>

        {/* Links Grid */}
        <div style={s.linksGrid}>
          <div style={s.linkColumn}>
            <h3 style={s.columnTitle}>للتسوق</h3>
            <nav style={s.linkList}>
              <Link to="/" style={s.link}>الرئيسية</Link>
              <Link to="/products" style={s.link}>جميع المنتجات</Link>
              <Link to="/sellers" style={s.link}>الباعة</Link>
              <Link to="/my-orders" style={s.link}>طلباتي</Link>
            </nav>
          </div>

          <div style={s.linkColumn}>
            <h3 style={s.columnTitle}>للباعة</h3>
            <nav style={s.linkList}>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={s.link}>
                ابدأ البيع
              </a>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={s.link}>
                بوابة البائع
              </a>
              <a href={SELLER_PORTAL_URL} target="_blank" rel="noreferrer" style={s.link}>
                إدارة المتجر
              </a>
            </nav>
          </div>

          <div style={s.linkColumn}>
            <h3 style={s.columnTitle}>المساعدة</h3>
            <nav style={s.linkList}>
              <Link to="/help" style={s.link}>مركز الدعم</Link>
              <Link to="/about" style={s.link}>عن رحبة</Link>
              <Link to="/privacy" style={s.link}>سياسة الخصوصية</Link>
              <Link to="/terms" style={s.link}>الشروط والأحكام</Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={s.bottom}>
          <div style={s.bottomLeft}>
            <span style={s.copyright}>© 2026 رحبة — جميع الحقوق محفوظة</span>
          </div>
          <div style={s.bottomRight}>
            <span style={s.madeIn}>صُنع في المغرب</span>
            <span style={s.separator}>•</span>
            <span style={s.powered}>Powered by Cloudflare</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Icons
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L2 3v4c0 3 2 5.5 5 6.5 3-1 5-3.5 5-6.5V3L7 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 7l1.5 1.5L9.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3h7v7H1zM8 5.5h2.5l2 2V10h-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="3.5" cy="11" r="1.25" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10.5" cy="11" r="1.25" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const s = {
  footer: {
    background: UI.colors.bgElevated,
    borderTop: `1px solid ${UI.colors.border}`,
    marginTop: "auto"
  },
  container: {
    padding: "32px 16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  brandTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoMark: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.md,
    background: `linear-gradient(135deg, ${UI.colors.accent} 0%, ${UI.colors.accentHover} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logoLetter: {
    color: UI.colors.bgDeep,
    fontSize: "22px",
    fontWeight: 800
  },
  logoName: {
    color: UI.colors.text,
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1
  },
  logoTag: {
    color: UI.colors.accent,
    fontSize: "12px",
    fontWeight: 600,
    marginTop: "4px"
  },
  brandDesc: {
    color: UI.colors.textSecondary,
    fontSize: "14px",
    lineHeight: 1.7,
    maxWidth: "360px",
    margin: 0
  },
  trustBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  trustBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.sm,
    color: UI.colors.textSecondary,
    fontSize: "12px",
    fontWeight: 500
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px"
  },
  linkColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  columnTitle: {
    margin: 0,
    color: UI.colors.text,
    fontSize: "14px",
    fontWeight: 600
  },
  linkList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  link: {
    color: UI.colors.textMuted,
    fontSize: "13px",
    textDecoration: "none",
    transition: "color 0.2s ease"
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "24px",
    borderTop: `1px solid ${UI.colors.border}`,
    "@media (min-width: 640px)": {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }
  },
  bottomLeft: {
    display: "flex",
    alignItems: "center"
  },
  bottomRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  copyright: {
    color: UI.colors.textMuted,
    fontSize: "13px"
  },
  madeIn: {
    color: UI.colors.textMuted,
    fontSize: "13px"
  },
  separator: {
    color: UI.colors.textSoft,
    fontSize: "10px"
  },
  powered: {
    color: UI.colors.textMuted,
    fontSize: "13px"
  }
};
