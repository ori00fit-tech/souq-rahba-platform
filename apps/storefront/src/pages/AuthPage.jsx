import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../lib/config";

const TABS = {
  login: "login",
  register: "register"
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authLoading, loginUser } = useApp();

  const [tab, setTab] = useState(TABS.login);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

  const googleUrl = useMemo(() => `${API_BASE_URL}/auth/google/login`, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const google = params.get("google");

    async function consumeGoogleToken() {
      if (!token) return;

      try {
        setLoadingGoogle(true);
        setMessage("");
        await loginUser(token);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setMessage("تعذر إتمام تسجيل الدخول عبر Google");
      } finally {
        setLoadingGoogle(false);
      }
    }

    if (google === "success" && token) {
      consumeGoogleToken();
    }
  }, [location.search, loginUser, navigate]);

  if (!authLoading && currentUser) {
    return <Navigate to="/" replace />;
  }

  function updateLoginField(name, value) {
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateRegisterField(name, value) {
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const res = await apiPost("/auth/login", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      if (!res?.ok || !res?.data?.token) {
        setMessage(res?.message || "تعذر تسجيل الدخول");
        return;
      }

      await loginUser(res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!registerForm.full_name.trim()) {
      setMessage("يرجى إدخال الاسم الكامل");
      return;
    }

    if (!registerForm.email.trim()) {
      setMessage("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!registerForm.password) {
      setMessage("يرجى إدخال كلمة السر");
      return;
    }

    if (registerForm.password.length < 6) {
      setMessage("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (registerForm.password !== registerForm.confirm_password) {
      setMessage("تأكيد كلمة السر غير مطابق");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const res = await apiPost("/auth/register", {
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim() || null,
        password: registerForm.password,
        role: "buyer"
      });

      if (!res?.ok || !res?.data?.token) {
        setMessage(res?.message || "تعذر إنشاء الحساب");
        return;
      }

      await loginUser(res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.wrap}>
        <div style={s.hero}>
          <div style={s.heroBadge}>RAHBA AUTH</div>
          <h1 style={s.title}>مرحباً بك في رحبة</h1>
          <p style={s.subtitle}>
            سجّل الدخول بسرعة عبر Google أو أنشئ حسابك بالبريد الإلكتروني لإتمام الطلبات وتتبعها.
          </p>

          <a
            href={googleUrl}
            style={s.googleBtn}
            onClick={() => setLoadingGoogle(true)}
          >
            <span style={s.googleIcon}>G</span>
            <span>{loadingGoogle ? "جاري التحويل..." : "المتابعة عبر Google"}</span>
          </a>

          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>أو</span>
            <span style={s.dividerLine} />
          </div>

          <div style={s.tabs}>
            <button
              type="button"
              onClick={() => {
                setTab(TABS.login);
                setMessage("");
              }}
              style={{
                ...s.tabBtn,
                ...(tab === TABS.login ? s.tabBtnActive : {})
              }}
            >
              تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => {
                setTab(TABS.register);
                setMessage("");
              }}
              style={{
                ...s.tabBtn,
                ...(tab === TABS.register ? s.tabBtnActive : {})
              }}
            >
              إنشاء حساب
            </button>
          </div>

          {message ? <div style={s.message}>{message}</div> : null}

          {tab === TABS.login ? (
            <form onSubmit={handleLogin} style={s.form}>
              <Field label="البريد الإلكتروني">
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => updateLoginField("email", e.target.value)}
                  style={s.input}
                  placeholder="name@example.com"
                />
              </Field>

              <Field label="كلمة السر">
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => updateLoginField("password", e.target.value)}
                  style={s.input}
                  placeholder="••••••••"
                />
              </Field>

              <button type="submit" disabled={submitting || loadingGoogle} style={s.primaryBtn}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={s.form}>
              <Field label="الاسم الكامل">
                <input
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) => updateRegisterField("full_name", e.target.value)}
                  style={s.input}
                  placeholder="الاسم الكامل"
                />
              </Field>

              <Field label="البريد الإلكتروني">
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => updateRegisterField("email", e.target.value)}
                  style={s.input}
                  placeholder="name@example.com"
                />
              </Field>

              <Field label="رقم الهاتف">
                <input
                  type="text"
                  value={registerForm.phone}
                  onChange={(e) => updateRegisterField("phone", e.target.value)}
                  style={s.input}
                  placeholder="06XXXXXXXX"
                />
              </Field>

              <Field label="كلمة السر">
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => updateRegisterField("password", e.target.value)}
                  style={s.input}
                  placeholder="6 أحرف على الأقل"
                />
              </Field>

              <Field label="تأكيد كلمة السر">
                <input
                  type="password"
                  value={registerForm.confirm_password}
                  onChange={(e) => updateRegisterField("confirm_password", e.target.value)}
                  style={s.input}
                  placeholder="أعد كتابة كلمة السر"
                />
              </Field>

              <button type="submit" disabled={submitting || loadingGoogle} style={s.primaryBtn}>
                {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  );
}

const s = {
  wrap: {
    maxWidth: "560px",
    margin: "0 auto"
  },
  hero: {
    background: "#fff",
    border: "1px solid #e7dccf",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(27,58,107,0.08)",
    display: "grid",
    gap: "18px"
  },
  heroBadge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1b3a6b",
    fontWeight: 800,
    fontSize: "12px"
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#1b3a6b",
    fontWeight: 900
  },
  subtitle: {
    margin: 0,
    color: "#6e6357",
    lineHeight: 1.8
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #d8dee9",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 800
  },
  googleIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    fontWeight: 900
  },
  divider: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "12px"
  },
  dividerLine: {
    height: "1px",
    background: "#e5e7eb",
    display: "block"
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
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #d6d3d1",
    background: "#fff",
    color: "#374151",
    fontWeight: 800,
    cursor: "pointer"
  },
  tabBtnActive: {
    background: "#1b3a6b",
    color: "#fff",
    borderColor: "#1b3a6b"
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
    fontWeight: 800,
    color: "#1f2937",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: "15px",
    boxSizing: "border-box"
  },
  primaryBtn: {
    padding: "14px 18px",
    borderRadius: "16px",
    border: "none",
    background: "#1b3a6b",
    color: "#fff",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer"
  },
  message: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    fontWeight: 700
  }
};
