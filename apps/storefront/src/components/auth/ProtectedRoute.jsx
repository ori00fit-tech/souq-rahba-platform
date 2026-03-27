import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function ProtectedRoute({
  children,
  allowRoles = []
}) {
  const location = useLocation();
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="loading-state">جاري التحقق من الجلسة...</div>
      </section>
    );
  }

  if (!currentUser) {
    const redirect = `${location.pathname}${location.search || ""}`;
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(redirect)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    if (!allowRoles.includes(currentUser.role)) {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }
  }

  return children;
}
