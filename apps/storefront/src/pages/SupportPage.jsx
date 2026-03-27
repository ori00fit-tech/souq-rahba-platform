import { Link } from "react-router-dom";

export default function SupportPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA SUPPORT</div>
          <h1 className="page-title">الدعم</h1>
          <p className="page-subtitle">
            نحن هنا لمساعدتك في الطلبات، الحساب، الشحن، والدفع داخل منصة رحبة.
          </p>
        </div>

        <div style={s.grid}>
          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>مساعدة الطلبات</h2>
            <p style={s.text}>
              إذا واجهت مشكلة في إنشاء الطلب، تتبع الحالة، أو استلام المنتج، راجع صفحة
              طلباتك أو تواصل معنا عبر صفحة الاتصال.
            </p>
            <Link to="/my-orders" className="btn btn-primary full-width">
              الذهاب إلى طلباتي
            </Link>
          </article>

          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>مساعدة الحساب</h2>
            <p style={s.text}>
              إذا كنت تواجه مشكلة في تسجيل الدخول أو إنشاء الحساب، تأكد من صحة البريد
              الإلكتروني وكلمة السر ثم حاول مرة أخرى.
            </p>
            <Link to="/auth" className="btn btn-secondary full-width">
              الذهاب إلى الحساب
            </Link>
          </article>

          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>تواصل مباشر</h2>
            <p style={s.text}>
              في حالة وجود استفسار خاص أو مشكلة تتطلب متابعة، استخدم صفحة الاتصال وسنراجع
              طلبك في أقرب وقت.
            </p>
            <Link to="/contact" className="btn btn-primary full-width">
              صفحة الاتصال
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "10px"
  },
  grid: {
    display: "grid",
    gap: "14px"
  },
  card: {
    padding: "18px",
    display: "grid",
    gap: "12px"
  },
  title: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900,
    fontSize: "20px"
  },
  text: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.9
  }
};
