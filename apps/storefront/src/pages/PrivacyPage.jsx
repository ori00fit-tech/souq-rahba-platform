export default function PrivacyPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA PRIVACY</div>
          <h1 className="page-title">سياسة الخصوصية</h1>
          <p className="page-subtitle">
            تشرح هذه الصفحة كيف تجمع رحبة البيانات الأساسية وكيفية استخدامها لحماية
            الحسابات وتحسين تجربة الشراء.
          </p>
        </div>

        <article className="ui-card" style={s.card}>
          <h2 style={s.title}>البيانات التي قد نجمعها</h2>
          <p style={s.text}>
            قد تشمل البيانات الاسم، البريد الإلكتروني، رقم الهاتف، معلومات الطلب، وعناوين
            التوصيل اللازمة لتنفيذ الخدمات داخل المنصة.
          </p>

          <h2 style={s.title}>كيفية الاستخدام</h2>
          <p style={s.text}>
            تُستخدم البيانات لإدارة الحساب، معالجة الطلبات، تحسين الأمان، وتقديم دعم أفضل
            للمستخدمين.
          </p>

          <h2 style={s.title}>حماية البيانات</h2>
          <p style={s.text}>
            تعمل رحبة على تقليل الوصول غير المصرح به واتخاذ إجراءات تقنية وتنظيمية مناسبة
            لحماية البيانات.
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
