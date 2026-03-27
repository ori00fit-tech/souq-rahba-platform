export default function ContactPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA CONTACT</div>
          <h1 className="page-title">اتصل بنا</h1>
          <p className="page-subtitle">
            لأي استفسار بخصوص الطلبات، الشحن، أو استخدام المنصة، يمكنك مراسلتنا عبر
            القنوات التالية.
          </p>
        </div>

        <div style={s.grid}>
          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>البريد الإلكتروني</h2>
            <p style={s.text}>support@rahba.site</p>
          </article>

          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>الهاتف</h2>
            <p style={s.text}>سيتم توفير رقم الدعم الرسمي قريباً.</p>
          </article>

          <article className="ui-card" style={s.card}>
            <h2 style={s.title}>ساعات المتابعة</h2>
            <p style={s.text}>
              من الإثنين إلى السبت — من 09:00 إلى 18:00 بتوقيت المغرب.
            </p>
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
    gap: "10px"
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
