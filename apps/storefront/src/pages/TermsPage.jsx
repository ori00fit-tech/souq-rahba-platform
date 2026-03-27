export default function TermsPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA TERMS</div>
          <h1 className="page-title">الشروط والأحكام</h1>
          <p className="page-subtitle">
            باستخدام منصة رحبة، فإنك توافق على الالتزام بهذه الشروط المنظمة لاستخدام
            المنصة وعمليات الشراء والبيع.
          </p>
        </div>

        <article className="ui-card" style={s.card}>
          <h2 style={s.title}>استخدام المنصة</h2>
          <p style={s.text}>
            يجب استخدام رحبة بشكل قانوني ومسؤول، مع تقديم معلومات صحيحة أثناء التسجيل
            والطلبات.
          </p>

          <h2 style={s.title}>الطلبات والدفع</h2>
          <p style={s.text}>
            تخضع الطلبات للتوفر، التحقق، وسياسات البائعين المعتمدين داخل المنصة. بعض طرق
            الدفع أو الشحن قد تتغير حسب المرحلة التشغيلية.
          </p>

          <h2 style={s.title}>المحتوى والمسؤولية</h2>
          <p style={s.text}>
            تسعى رحبة لتقديم تجربة موثوقة، لكن وصف المنتجات ومسؤولية تنفيذ الطلب تبقى ضمن
            التزامات البائع وفق السياسات المعتمدة.
          </p>
        </article>
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
  card: {
    padding: "18px",
    display: "grid",
    gap: "14px"
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
    lineHeight: 1.95
  }
};
