import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../lib/config";

const TAB_LOGIN = "login";
const TAB_REGISTER = "register";

function getApiErrorMessage(result, fallback) {
  return result?.error?.message || result?.message || fallback;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizePhone(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function isValidMoroccanPhone(value) {
  const phone = normalizePhone(value);
  if (!phone) return true;
  return /^(\+212|212|0)[5-7][0-9]{8}$/.test(phone);
}

function sanitizeRedirectPath(input) {
  const value = String(input || "").trim();
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  if (value.startsWith("/auth")) return "/";
  return value;
}

function Field({ label, children, hint }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
      {hint ? <span style={styles.hint}>{hint}</span> : null}
    </label>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authLoading, loginUser } = useApp();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTo = useMemo(
    () => sanitizeRedirectPath(params.get("redirect") || location.state?.from?.pathname || "/"),
    [params, location.state]
  );

  const [tab, setTab] = useState(
    params.get("tab") === TAB_REGISTER ? TAB_REGISTER : TAB_LOGIN
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("neutral");
  const [submitting, setSubmitting] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: ""
  });

  const googleUrl = useMemo(() => {
    const url = new URL(`${API_BASE_URL}/auth/google/login`);
    if (redirectTo && redirectTo !== "/") {
      url.searchParams.set("redirect", redirectTo);
    }
    return url.toString();
  }, [redirectTo]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, currentUser, navigate, redirectTo]);

  useEffect(() => {
    const token = params.get("token");
    const provider = params.get("provider");

    async function consumeGoogleToken() {
      if (!token) return;

      try {
        setLoadingGoogle(true);
        setMessage("");
        await loginUser(token);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error(err);
        setMessageType("error");
        setMessage("تعذر إكمال تسجيل الدخول عبر Google");
      } finally {
        setLoadingGoogle(false);

        const cleanParams = new URLSearchParams(location.search);
        cleanParams.delete("token");
        cleanParams.delete("provider");
        navigate(
          {
            pathname: location.pathname,
            search: cleanParams.toString() ? `?${cleanParams.toString()}` : ""
          },
          { replace: true }
        );
      }
    }

    if (provider === "google" && token) {
      consumeGoogleToken();
    }
  }, [params, loginUser, navigate, redirectTo, location.pathname, location.search]);

  function switchTab(nextTab) {
    setTab(nextTab);
    setMessage("");
    setMessageType("neutral");
  }

  function updateLoginField(name, value) {
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateRegisterField(name, value) {
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateLogin() {
    if (!loginForm.email.trim() || !loginForm.password) {
      return "يرجى إدخال البريد الإلكتروني وكلمة السر";
    }

    if (!isValidEmail(loginForm.email)) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }

    return "";
  }

  function validateRegister() {
    if (!registerForm.full_name.trim()) {
      return "يرجى إدخال الاسم الكامل";
    }

    if (!registerForm.email.trim()) {
      return "يرجى إدخال البريد الإلكتروني";
    }

    if (!isValidEmail(registerForm.email)) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (registerForm.phone.trim() && !isValidMoroccanPhone(registerForm.phone)) {
      return "يرجى إدخال رقم هاتف مغربي صحيح";
    }

    if (!registerForm.password) {
      return "يرجى إدخال كلمة السر";
    }

    if (registerForm.password.length < 8) {
      return "كلمة السر يجب أن تكون 8 أحرف على الأقل";
    }

    if (registerForm.password !== registerForm.confirm_password) {
      return "تأكيد كلمة السر غير مطابق";
    }

    return "";
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (submitting || loadingGoogle || authLoading) return;

    const validationError = validateLogin();
    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("neutral");

      const result = await apiPost("/auth/login", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      if (!result?.ok) {
        setMessageType("error");
        setMessage(getApiErrorMessage(result, "تعذر تسجيل الدخول"));
        return;
      }

      const token = result?.data?.token;
      if (!token) {
        setMessageType("error");
        setMessage("لم يتم العثور على رمز الجلسة");
        return;
      }

      await loginUser(token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("تعذر تسجيل الدخول، تحقق من البيانات ثم حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (submitting || loadingGoogle || authLoading) return;

    const validationError = validateRegister();
    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("neutral");

      const registerResult = await apiPost("/auth/register", {
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: normalizePhone(registerForm.phone),
        password: registerForm.password,
        role: "buyer",
        locale: "ar"
      });

      if (!registerResult?.ok) {
        setMessageType("error");
        setMessage(getApiErrorMessage(registerResult, "تعذر إنشاء الحساب"));
        return;
      }

      const loginResult = await apiPost("/auth/login", {
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password
      });

      if (!loginResult?.ok) {
        setMessageType("success");
        setMessage("تم إنشاء الحساب بنجاح. قم بتسجيل الدخول للمتابعة.");
        setTab(TAB_LOGIN);
        setLoginForm({
          email: registerForm.email.trim().toLowerCase(),
          password: ""
        });
        return;
      }

      const token = loginResult?.data?.token;
      if (!token) {
        setMessageType("success");
        setMessage("تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائياً.");
        setTab(TAB_LOGIN);
        setLoginForm({
          email: registerForm.email.trim().toLowerCase(),
          password: ""
        });
        return;
      }

      await loginUser(token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("تعذر إنشاء الحساب، حاول مرة أخرى بعد قليل");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.badge}>RAHBA</div>
          <h1 style={styles.heroTitle}>دخول احترافي إلى رحبة</h1>
          <p style={styles.heroText}>
            سجل الدخول بسرعة عبر Google أو بالبريد الإلكتروني، واحفظ طلباتك
            وتابع مشترياتك داخل منصة رحبة بشكل آمن وسلس.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span>دخول سريع وآمن</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🛍️</span>
              <span>متابعة الطلبات بسهولة</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🔒</span>
              <span>جلسة مستقرة ومحمية</span>
            </div>
          </div>
        </div>

        <div style={styles.cardWrap}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                {tab === TAB_LOGIN ? "تسجيل الدخول" : "إنشاء حساب جديد"}
              </h2>
              <p style={styles.cardSubtitle}>
                {tab === TAB_LOGIN
                  ? "أدخل بياناتك للمتابعة"
                  : "أنشئ حسابك وابدأ الشراء داخل رحبة"}
              </p>
            </div>

            <a
              href={submitting ? "#" : googleUrl}
              style={{
                ...styles.googleBtn,
                ...(submitting || loadingGoogle || authLoading ? styles.googleBtnDisabled : {})
              }}
              onClick={(e) => {
                if (submitting || loadingGoogle || authLoading) {
                  e.preventDefault();
                }
              }}
            >
              <span style={styles.googleIcon}>G</span>
              <span>
                {loadingGoogle ? "جاري المتابعة عبر Google..." : "المتابعة عبر Google"}
              </span>
            </a>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>أو</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.tabs}>
              <button
                type="button"
                onClick={() => switchTab(TAB_REGISTER)}
                style={{
                  ...styles.tabBtn,
                  ...(tab === TAB_REGISTER ? styles.tabBtnActive : {})
                }}
              >
                إنشاء حساب
              </button>

              <button
                type="button"
                onClick={() => switchTab(TAB_LOGIN)}
                style={{
                  ...styles.tabBtn,
                  ...(tab === TAB_LOGIN ? styles.tabBtnActive : {})
                }}
              >
                تسجيل الدخول
              </button>
            </div>

            {message ? (
              <div
                style={{
                  ...styles.message,
                  ...(messageType === "error" ? styles.messageError : {}),
                  ...(messageType === "success" ? styles.messageSuccess : {})
                }}
              >
                {message}
              </div>
            ) : null}

            {tab === TAB_LOGIN ? (
              <form style={styles.form} onSubmit={handleLoginSubmit}>
                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => updateLoginField("email", e.target.value)}
                    placeholder="name@example.com"
                    style={styles.input}
                    autoComplete="email"
                    dir="ltr"
                  />
                </Field>

                <Field label="كلمة السر">
                  <div style={styles.passwordWrap}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => updateLoginField("password", e.target.value)}
                      placeholder="••••••••"
                      style={styles.passwordInput}
                      autoComplete="current-password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      style={styles.passwordToggle}
                    >
                      {showLoginPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={submitting || loadingGoogle || authLoading}
                  style={{
                    ...styles.primaryBtn,
                    ...(submitting || loadingGoogle || authLoading ? styles.primaryBtnDisabled : {})
                  }}
                >
                  {submitting ? "جاري تسجيل الدخول..." : "دخول"}
                </button>
              </form>
            ) : (
              <form style={styles.form} onSubmit={handleRegisterSubmit}>
                <Field label="الاسم الكامل">
                  <input
                    type="text"
                    value={registerForm.full_name}
                    onChange={(e) => updateRegisterField("full_name", e.target.value)}
                    placeholder="الاسم الكامل"
                    style={styles.input}
                    autoComplete="name"
                  />
                </Field>

                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => updateRegisterField("email", e.target.value)}
                    placeholder="name@example.com"
                    style={styles.input}
                    autoComplete="email"
                    dir="ltr"
                  />
                </Field>

                <Field label="رقم الهاتف" hint="اختياري">
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => updateRegisterField("phone", e.target.value)}
                    placeholder="06xxxxxxxx"
                    style={styles.input}
                    autoComplete="tel"
                    dir="ltr"
                  />
                </Field>

                <Field label="كلمة السر" hint="8 أحرف على الأقل">
                  <div style={styles.passwordWrap}>
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) => updateRegisterField("password", e.target.value)}
                      placeholder="••••••••"
                      style={styles.passwordInput}
                      autoComplete="new-password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      style={styles.passwordToggle}
                    >
                      {showRegisterPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </Field>

                <Field label="تأكيد كلمة السر">
                  <div style={styles.passwordWrap}>
                    <input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      value={registerForm.confirm_password}
                      onChange={(e) =>
                        updateRegisterField("confirm_password", e.target.value)
                      }
                      placeholder="••••••••"
                      style={styles.passwordInput}
                      autoComplete="new-password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword((v) => !v)}
                      style={styles.passwordToggle}
                    >
                      {showRegisterConfirmPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={submitting || loadingGoogle || authLoading}
                  style={{
                    ...styles.primaryBtn,
                    ...(submitting || loadingGoogle || authLoading ? styles.primaryBtnDisabled : {})
                  }}
                >
                  {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </button>
              </form>
            )}

            <div style={styles.footer}>
              <NavLink to="/" style={styles.backLink}>
                العودة إلى الرئيسية
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "18px"
  },
  hero: {
    background: "linear-gradient(135deg, #0B4DBA 0%, #119ED9 55%, #17B890 100%)",
    borderRadius: "28px",
    padding: "24px",
    color: "#fff",
    display: "grid",
    gap: "16px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)"
  },
  badge: {
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "13px",
    fontWeight: 800
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(28px, 6vw, 42px)",
    fontWeight: 900,
    lineHeight: 1.15
  },
  heroText: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.9,
    fontSize: "15px"
  },
  featureList: {
    display: "grid",
    gap: "10px"
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 700
  },
  featureIcon: {
    width: "28px",
    height: "28px",
    display: "grid",
    placeItems: "center",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)"
  },
  cardWrap: {
    display: "grid"
  },
  card: {
    background: "#fff",
    border: "1.5px solid #ddd5c2",
    borderRadius: "24px",
    padding: "20px",
    display: "grid",
    gap: "16px",
    boxShadow: "0 4px 18px rgba(22,53,107,0.08)"
  },
  cardHeader: {
    display: "grid",
    gap: "6px"
  },
  cardTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900,
    fontSize: "24px"
  },
  cardSubtitle: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.8
  },
  googleBtn: {
    textDecoration: "none",
    minHeight: "52px",
    borderRadius: "16px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontWeight: 800
  },
  googleBtnDisabled: {
    opacity: 0.6,
    pointerEvents: "none"
  },
  googleIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "#f3f4f6",
    display: "grid",
    placeItems: "center",
    fontWeight: 900
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb"
  },
  dividerText: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  tabBtn: {
    minHeight: "46px",
    borderRadius: "14px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer"
  },
  tabBtnActive: {
    background: "#173b74",
    color: "#fff",
    borderColor: "#173b74"
  },
  message: {
    borderRadius: "14px",
    padding: "12px 14px",
    fontWeight: 700,
    lineHeight: 1.8,
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #e2e8f0"
  },
  messageError: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca"
  },
  messageSuccess: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0"
  },
  form: {
    display: "grid",
    gap: "14px"
  },
  field: {
    display: "grid",
    gap: "8px"
  },
  label: {
    color: "#374151",
    fontWeight: 800,
    fontSize: "14px"
  },
  hint: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 600
  },
  input: {
    width: "100%",
    minHeight: "50px",
    borderRadius: "14px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box"
  },
  passwordWrap: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
    alignItems: "center"
  },
  passwordInput: {
    width: "100%",
    minHeight: "50px",
    borderRadius: "14px",
    border: "1.5px solid #ddd5c2",
    background: "#fff",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box"
  },
  passwordToggle: {
    minHeight: "50px",
    borderRadius: "14px",
    border: "1.5px solid #ddd5c2",
    background: "#f8fafc",
    color: "#173b74",
    padding: "0 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  primaryBtn: {
    minHeight: "52px",
    borderRadius: "16px",
    border: "none",
    background: "#173b74",
    color: "#fff",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer"
  },
  primaryBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed"
  },
  footer: {
    display: "flex",
    justifyContent: "center"
  },
  backLink: {
    textDecoration: "none",
    color: "#173b74",
    fontWeight: 800
  }
};
