import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";
import { apiPost } from "@rahba/shared";

const USER_REGISTER_ENDPOINT = "/auth/register";
const SELLER_ONBOARDING_ENDPOINT = "/marketplace/onboarding";

const STORE_CATEGORIES = [
  "مواد غذائية",
  "إلكترونيات",
  "لوازم البحر",
  "المنزل والمطبخ",
  "الملابس",
  "الصحة والجمال",
  "التجهيزات المهنية",
  "أخرى"
];

function toSellerSlug(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginSeller } = useSellerAuth();

  const [tab, setTab] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    store_name: "",
    owner_name: "",
    phone: "",
    city: "",
    category: STORE_CATEGORIES[0],
    email: "",
    password: "",
    confirm_password: "",
    notes: "",
    accept_terms: false
  });

  const pageTitle = useMemo(() => {
    return tab === "login" ? "دخول البائع" : "تسجيل بائع جديد";
  }, [tab]);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function resetMessage() {
    setMessage("");
    setMessageType("info");
  }

  function validateLogin() {
    if (!loginForm.email.trim()) return "يرجى إدخال البريد الإلكتروني";
    if (!loginForm.password.trim()) return "يرجى إدخال كلمة السر";
    return "";
  }

  function validateRegister() {
    if (!registerForm.store_name.trim()) return "يرجى إدخال اسم المتجر";
    if (!registerForm.owner_name.trim()) return "يرجى إدخال اسم المسؤول";
    if (!registerForm.phone.trim()) return "يرجى إدخال رقم الهاتف";

    const phone = registerForm.phone.trim();
    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
      return "يرجى إدخال رقم هاتف مغربي صحيح";
    }

    if (!registerForm.city.trim()) return "يرجى إدخال المدينة";
    if (!registerForm.email.trim()) return "يرجى إدخال البريد الإلكتروني";
    if (!registerForm.password.trim()) return "يرجى إدخال كلمة السر";
    if (registerForm.password.length < 6) return "كلمة السر يجب أن تكون 6 أحرف على الأقل";

    if (registerForm.password !== registerForm.confirm_password) {
      return "تأكيد كلمة السر غير مطابق";
    }

    if (!registerForm.accept_terms) {
      return "يجب الموافقة على الشروط قبل إرسال الطلب";
    }

    return "";
  }

  async function handleLogin(e) {
    e.preventDefault();

    const error = validateLogin();
    if (error) {
      showMessage(error, "error");
      return;
    }

    try {
      setSubmitting(true);
      resetMessage();

      const result = await loginSeller(
        loginForm.email.trim(),
        loginForm.password
      );

      if (!result?.ok) {
        showMessage(result?.message || "تعذر تسجيل الدخول", "error");
        return;
      }

      showMessage("تم تسجيل الدخول بنجاح، جاري تحويلك...", "success");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "حدث خطأ أثناء تسجيل الدخول", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    const error = validateRegister();
    if (error) {
      showMessage(error, "error");
      return;
    }

    const sellerSlug = toSellerSlug(registerForm.store_name);

    if (!sellerSlug) {
      showMessage("اسم المتجر يجب أن ينتج slug لاتيني صالح مثل my-store", "error");
      return;
    }

    try {
      setSubmitting(true);
      resetMessage();

      // 1) إنشاء حساب user بدور seller
      const registerResult = await apiPost(USER_REGISTER_ENDPOINT, {
        email: registerForm.email.trim(),
        password: registerForm.password,
        full_name: registerForm.owner_name.trim(),
        phone: registerForm.phone.trim(),
        role: "seller"
      });

      if (!registerResult?.ok) {
        showMessage(registerResult?.message || "تعذر إنشاء حساب البائع", "error");
        return;
      }

      // 2) تسجيل الدخول عبر context للحصول على session صحيحة
      const loginResult = await loginSeller(
        registerForm.email.trim(),
        registerForm.password
      );

      if (!loginResult?.ok) {
        showMessage(
          loginResult?.message || "تم إنشاء الحساب لكن تعذر تسجيل الدخول تلقائياً",
          "error"
        );
        return;
      }

      // 3) إنشاء seller profile / onboarding
      const onboardingResult = await apiPost(SELLER_ONBOARDING_ENDPOINT, {
        display_name: registerForm.store_name.trim(),
        slug: sellerSlug,
        city: registerForm.city.trim(),
        phone: registerForm.phone.trim(),
        category: registerForm.category,
        description: registerForm.notes.trim() || null
      });

      if (!onboardingResult?.ok) {
        showMessage(
          onboardingResult?.message ||
            onboardingResult?.code ||
            "تم إنشاء الحساب لكن تعذر إكمال ملف البائع. يمكنك المتابعة من صفحة الدخول.",
          "error"
        );
        return;
      }

      showMessage(
        "تم إنشاء حساب البائع بنجاح. جاري تحويلك إلى مرحلة المراجعة.",
        "success"
      );

      setTimeout(() => {
        navigate("/onboarding", { replace: true });
      }, 700);
    } catch (error) {
      console.error(error);
      showMessage(error?.message || "حدث خطأ أثناء تسجيل البائع الجديد", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={s.page} dir="rtl">
      <div style={s.shell}>
        <div style={s.card}>
          <div style={s.hero}>
            <div style={s.badge}>RAHBA SELLER</div>
            <h1 style={s.title}>{pageTitle}</h1>
            <p style={s.subtitle}>
              {tab === "login"
                ? "ادخل لإدارة متجرك، المنتجات، الطلبات، والأرباح من بوابة البائع."
                : "أنشئ حساب بائع جديد وابدأ بيع منتجاتك داخل رحبة بطريقة احترافية."}
            </p>
          </div>

          <div style={s.tabs}>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                resetMessage();
              }}
              style={{
                ...s.tabButton,
                ...(tab === "login" ? s.tabButtonActive : {})
              }}
            >
              دخول البائع
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                resetMessage();
              }}
              style={{
                ...s.tabButton,
                ...(tab === "register" ? s.tabButtonActive : {})
              }}
            >
              تسجيل بائع جديد
            </button>
          </div>

          {message ? (
            <div
              style={{
                ...s.notice,
                ...(messageType === "success"
                  ? s.noticeSuccess
                  : messageType === "error"
                  ? s.noticeError
                  : s.noticeInfo)
              }}
            >
              {message}
            </div>
          ) : null}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={s.form}>
              <label style={s.label}>
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="seller@example.com"
                  style={s.input}
                  autoComplete="email"
                />
              </label>

              <label style={s.label}>
                <span>كلمة السر</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  style={s.input}
                  autoComplete="current-password"
                />
              </label>

              <button type="submit" disabled={submitting} style={s.primaryButton}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={s.form}>
              <label style={s.label}>
                <span>اسم المتجر</span>
                <input
                  type="text"
                  value={registerForm.store_name}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, store_name: e.target.value }))
                  }
                  placeholder="مثلاً: My Tech Store"
                  style={s.input}
                />
              </label>

              <label style={s.label}>
                <span>اسم المسؤول</span>
                <input
                  type="text"
                  value={registerForm.owner_name}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, owner_name: e.target.value }))
                  }
                  placeholder="الاسم الكامل"
                  style={s.input}
                />
              </label>

              <label style={s.label}>
                <span>رقم الهاتف</span>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="06xxxxxxxx"
                  style={s.input}
                  inputMode="tel"
                />
              </label>

              <label style={s.label}>
                <span>المدينة</span>
                <input
                  type="text"
                  value={registerForm.city}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="مثلاً: الدار البيضاء"
                  style={s.input}
                />
              </label>

              <label style={s.label}>
                <span>الفئة</span>
                <select
                  value={registerForm.category}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  style={s.input}
                >
                  {STORE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label style={s.label}>
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="store@example.com"
                  style={s.input}
                  autoComplete="email"
                />
              </label>

              <label style={s.label}>
                <span>كلمة السر</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="على الأقل 6 أحرف"
                  style={s.input}
                  autoComplete="new-password"
                />
              </label>

              <label style={s.label}>
                <span>تأكيد كلمة السر</span>
                <input
                  type="password"
                  value={registerForm.confirm_password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      confirm_password: e.target.value
                    }))
                  }
                  placeholder="أعد كتابة كلمة السر"
                  style={s.input}
                  autoComplete="new-password"
                />
              </label>

              <label style={s.label}>
                <span>ملاحظات إضافية</span>
                <textarea
                  value={registerForm.notes}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="نوع النشاط، المنتجات التي ستبيعها، أو أي تفاصيل مفيدة..."
                  style={s.textarea}
                />
              </label>

              <label style={s.checkboxRow}>
                <input
                  type="checkbox"
                  checked={registerForm.accept_terms}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      accept_terms: e.target.checked
                    }))
                  }
                />
                <span>أوافق على شروط المنصة وسياسة مراجعة حسابات البائعين</span>
              </label>

              <button type="submit" disabled={submitting} style={s.primaryButton}>
                {submitting ? "جاري إرسال الطلب..." : "إرسال طلب التسجيل"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const s = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #f4f1ea 0%, #f7f5ef 100%)",
    padding: "20px 14px 40px"
  },
  shell: {
    width: "100%",
    maxWidth: "560px",
    margin: "0 auto"
  },
  card: {
    background: "#ffffff",
    borderRadius: "28px",
    border: "1px solid #e9dfd2",
    boxShadow: "0 24px 50px rgba(23,59,116,0.08)",
    padding: "22px 16px",
    display: "grid",
    gap: "16px"
  },
  hero: {
    display: "grid",
    gap: "10px",
    textAlign: "center"
  },
  badge: {
    margin: "0 auto",
    minHeight: "34px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 900
  },
  title: {
    margin: 0,
    color: "#0f1d3a",
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 900
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: 1.9
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  tabButton: {
    minHeight: "48px",
    borderRadius: "16px",
    border: "1px solid #dde5ef",
    background: "#f8fafc",
    color: "#4b5563",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer"
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#ffffff",
    border: "none"
  },
  notice: {
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "14px",
    lineHeight: 1.8,
    fontWeight: 700
  },
  noticeInfo: {
    background: "#eef6ff",
    color: "#173b74"
  },
  noticeSuccess: {
    background: "#ecfdf5",
    color: "#166534"
  },
  noticeError: {
    background: "#fef2f2",
    color: "#b91c1c"
  },
  form: {
    display: "grid",
    gap: "14px"
  },
  label: {
    display: "grid",
    gap: "8px",
    color: "#1f2937",
    fontWeight: 800,
    fontSize: "14px"
  },
  input: {
    width: "100%",
    minHeight: "56px",
    borderRadius: "18px",
    border: "1px solid #d9dde5",
    background: "#ffffff",
    padding: "0 16px",
    fontSize: "16px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    borderRadius: "18px",
    border: "1px solid #d9dde5",
    background: "#ffffff",
    padding: "14px 16px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical"
  },
  checkboxRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: 1.8,
    fontWeight: 700
  },
  primaryButton: {
    minHeight: "56px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(20,150,127,0.18)",
    cursor: "pointer"
  }
};
