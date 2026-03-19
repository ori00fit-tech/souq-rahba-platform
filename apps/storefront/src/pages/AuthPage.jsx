import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
    if (!authLoading && currentUser) {
      navigate("/", { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const provider = params.get("provider");

    async function consumeGoogleToken() {
      if (!token) return;

      try {
        setLoadingGoogle(true);
        setMessage("");
        await loginUser(token);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setMessage("تعذر إكمال تسجيل الدخول عبر Google");
      } finally {
        setLoadingGoogle(false);
      }
    }

    if (provider === "google" && token) {
      consumeGoogleToken();
    }
  }, [location.search, loginUser, navigate]);

  async function handleLoginSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const result = await apiPost("/auth/login", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      if (!result.ok) {
        setMessage(result.message || "تعذر تسجيل الدخول");
        return;
      }

      const token = result?.data?.token;
      if (!token) {
        setMessage("لم يتم العثور على رمز الجلسة");
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
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

      const registerResult = await apiPost("/auth/register", {
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        role: "buyer",
        locale: "ar"
      });

      if (!registerResult.ok) {
        setMessage(registerResult.message || "تعذر إنشاء الحساب");
        return;
      }

      const loginResult = await apiPost("/auth/login", {
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password
      });

      if (!loginResult.ok) {
        setMessage("تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائياً");
        setTab(TABS.login);
        return;
      }

      const token = loginResult?.data?.token;
      if (!token) {
        setMessage("تم إنشاء الحساب، لكن لم يتم العثور على رمز الجلسة");
        setTab(TABS.login);
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="auth-shell">
        <div className="auth-card auth-card-wide">
          <div className="auth-badge">RAHBA AUTH</div>

          <h1 className="auth-title">مرحباً بك في رحبة</h1>
          <p className="auth-subtitle">
            سجل الدخول بسرعة عبر Google أو أنشئ حسابك بالبريد الإلكتروني لإتمام الطلبات وتتبعها.
          </p>

          <a href={googleUrl} className="auth-google-btn">
            <span className="auth-google-icon">G</span>
            <span>
              {loadingGoogle ? "جاري المتابعة..." : "المتابعة عبر Google"}
            </span>
          </a>

          <div className="auth-divider">
            <span>أو</span>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${tab === TABS.register ? "is-active" : ""}`}
              onClick={() => {
                setTab(TABS.register);
                setMessage("");
              }}
            >
              إنشاء حساب
            </button>

            <button
              type="button"
              className={`auth-tab ${tab === TABS.login ? "is-active" : ""}`}
              onClick={() => {
                setTab(TABS.login);
                setMessage("");
              }}
            >
              تسجيل الدخول
            </button>
          </div>

          {message ? <div className="auth-message-box">{message}</div> : null}

          {tab === TABS.login ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@example.com"
                  className="ui-input"
                  autoComplete="email"
                />
              </div>

              <div className="auth-form-group">
                <label>كلمة السر</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="ui-input"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={submitting || authLoading || loadingGoogle}
              >
                {submitting ? "جاري تسجيل الدخول..." : "دخول"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form-group">
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Talidi Chafik"
                  className="ui-input"
                  autoComplete="name"
                />
              </div>

              <div className="auth-form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="talidichafiq@gmail.com"
                  className="ui-input"
                  autoComplete="email"
                />
              </div>

              <div className="auth-form-group">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="0618072884"
                  className="ui-input"
                  autoComplete="tel"
                />
              </div>

              <div className="auth-form-group">
                <label>كلمة السر</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="ui-input"
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-form-group">
                <label>تأكيد كلمة السر</label>
                <input
                  type="password"
                  value={registerForm.confirm_password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      confirm_password: e.target.value
                    }))
                  }
                  placeholder="••••••••"
                  className="ui-input"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={submitting || authLoading || loadingGoogle}
              >
                {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </button>
            </form>
          )}

          <div className="auth-footer-links">
            <NavLink to="/" className="auth-back-home">
              العودة إلى الرئيسية
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
