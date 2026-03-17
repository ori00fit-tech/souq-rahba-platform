export default function SettingsPage() {
  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>إعدادات المتجر</h1>
        <p>تحديث معلومات المتجر والبائع</p>
      </div>

      <form className="card settings-form">
        <input className="ui-input" type="text" placeholder="اسم المتجر" />
        <input className="ui-input" type="email" placeholder="البريد الإلكتروني" />
        <input className="ui-input" type="text" placeholder="رقم الهاتف" />
        <textarea className="ui-textarea" placeholder="وصف المتجر" rows="5" />
        <button type="button" className="ui-btn ui-btn--accent">
          حفظ الإعدادات
        </button>
      </form>
    </section>
  );
}
