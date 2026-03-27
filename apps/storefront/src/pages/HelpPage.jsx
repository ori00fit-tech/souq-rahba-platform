const buyerFaqs = [
  {
    q: "كيف أبحث عن منتج داخل رحبة؟",
    a: "يمكنك استخدام شريط البحث أو تصفح الفئات للوصول إلى المنتجات المتاحة داخل المنصة."
  },
  {
    q: "كيف أضيف منتجًا إلى السلة؟",
    a: "من صفحة المنتج يمكنك الضغط على زر أضف إلى السلة، ثم متابعة الطلب من صفحة السلة أو إتمام الشراء مباشرة حسب المسار المتاح."
  },
  {
    q: "كيف أتابع طلبي؟",
    a: "إذا كنت مسجلًا في المنصة، يمكنك الدخول إلى صفحة طلباتي ومراجعة حالة الطلب والتفاصيل المرتبطة به."
  },
  {
    q: "هل يمكن الشراء من عدة باعة في نفس الوقت؟",
    a: "يعتمد ذلك على طريقة تنفيذ الطلب الحالية داخل المنصة وعلى القيود التقنية المعتمدة في وقت الشراء."
  },
  {
    q: "ماذا أفعل إذا واجهت مشكلة في الطلب؟",
    a: "يمكنك التواصل مع الدعم عبر صفحة المساعدة مع إرسال رقم الطلب وشرح مختصر للمشكلة."
  }
];

const sellerFaqs = [
  {
    q: "كيف أبدأ البيع على رحبة؟",
    a: "يمكنك الدخول إلى بوابة البائع وإنشاء أو استكمال ملف المتجر وإضافة المنتجات."
  },
  {
    q: "كيف أضيف منتجًا جديدًا؟",
    a: "من لوحة البائع يمكنك إنشاء منتج جديد مع إدخال الاسم، الوصف، السعر، الصور، والمخزون."
  },
  {
    q: "كيف أتابع الطلبات؟",
    a: "من داخل لوحة البائع ستجد صفحات إدارة الطلبات، الحالة، والشحن حسب الأدوات المتاحة حاليًا."
  },
  {
    q: "هل كل الباعة يظهرون بنفس الطريقة؟",
    a: "تعمل رحبة على إبراز الباعة والمتاجر بشكل منظم، مع دعم حالات التوثيق أو المراجعة حيثما توفرت."
  }
];

const accountFaqs = [
  {
    q: "هل أحتاج إلى حساب للشراء؟",
    a: "بعض المسارات قد تسمح بالشراء كضيف، وبعضها قد يتطلب تسجيل الدخول حسب حالة الميزة داخل المنصة."
  },
  {
    q: "كيف أحمي حسابي؟",
    a: "ننصحك باستخدام كلمة مرور قوية وعدم مشاركة بيانات الدخول مع أي طرف آخر."
  },
  {
    q: "ماذا أفعل إذا لم أعد أستطيع تسجيل الدخول؟",
    a: "تواصل مع الدعم موضحًا البريد الإلكتروني المرتبط بالحساب وطبيعة المشكلة."
  }
];

function FaqBlock({ title, items }) {
  return (
    <article className="ui-card" style={styles.card}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.faqList}>
        {items.map((item) => (
          <div key={item.q} style={styles.faqItem}>
            <h3 style={styles.question}>{item.q}</h3>
            <p style={styles.answer}>{item.a}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function HelpPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={styles.hero}>
          <div className="ui-chip">المساعدة والدعم</div>
          <h1 className="page-title">أسئلة شائعة ودعم واضح لمستخدمي رحبة</h1>
          <p className="page-subtitle" style={styles.lead}>
            في هذه الصفحة ستجد إجابات عن الأسئلة الشائعة المتعلقة باستخدام رحبة، الطلبات، الحساب، الباعة، وكيفية التواصل مع الدعم عند الحاجة.
          </p>
        </div>

        <FaqBlock title="أسئلة شائعة للمشترين" items={buyerFaqs} />
        <FaqBlock title="أسئلة شائعة للبائعين" items={sellerFaqs} />
        <FaqBlock title="الحساب والأمان" items={accountFaqs} />

        <article className="ui-card" style={styles.card}>
          <h2 style={styles.title}>التواصل مع الدعم</h2>
          <p style={styles.body}>
            يمكنك التواصل مع فريق الدعم بخصوص مشاكل الطلبات، مشاكل الحساب، مشاكل عرض المنتجات، أو الأخطاء التقنية داخل المنصة.
          </p>

          <div style={styles.notice}>
            <strong style={styles.noticeTitle}>يرجى عند التواصل تزويدنا بـ:</strong>
            <ul style={styles.list}>
              <li>الاسم</li>
              <li>البريد الإلكتروني أو رقم الهاتف</li>
              <li>رقم الطلب إن وجد</li>
              <li>وصف مختصر وواضح للمشكلة</li>
            </ul>
          </div>

          <p style={styles.body}>
            نعمل باستمرار على تحسين تجربة رحبة، ونقدّر كل ملاحظة أو بلاغ يساعد على تطوير المنصة.
          </p>
        </article>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    display: "grid",
    gap: "14px",
    padding: "20px"
  },
  lead: {
    margin: 0,
    lineHeight: 1.9
  },
  card: {
    display: "grid",
    gap: "14px",
    padding: "20px"
  },
  title: {
    margin: 0,
    color: "#173b74",
    fontSize: "22px",
    fontWeight: 900
  },
  body: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.95,
    fontSize: "15px"
  },
  faqList: {
    display: "grid",
    gap: "14px"
  },
  faqItem: {
    padding: "14px",
    borderRadius: "16px",
    background: "#fcfbf7",
    border: "1px solid #e6ddca",
    display: "grid",
    gap: "8px"
  },
  question: {
    margin: 0,
    color: "#173b74",
    fontSize: "17px",
    fontWeight: 800
  },
  answer: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.9,
    fontSize: "14px"
  },
  notice: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fbff",
    border: "1px solid #d9e7fb",
    display: "grid",
    gap: "10px"
  },
  noticeTitle: {
    color: "#173b74"
  },
  list: {
    margin: 0,
    paddingRight: "18px",
    display: "grid",
    gap: "8px",
    color: "#4b5563"
  }
};
