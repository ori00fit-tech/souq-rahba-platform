import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";

function normalizeSeller(seller) {
  return {
    id: seller.id,
    slug: seller.slug || "",
    display_name: seller.display_name || seller.name || "متجر بدون اسم",
    city: seller.city || "المغرب",
    verified: Number(seller.verified || 0),
    kyc_status: seller.kyc_status || "pending",
    rating: Number(seller.rating || 0),
    logo_url: seller.logo_url || null,
    description:
      seller.description ||
      "بائع موثوق داخل منصة رحبة مع منتجات جاهزة للتصفح والطلب."
  };
}

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSellers() {
      try {
        setLoading(true);
        setMessage("");

        const result = await apiGet("/catalog/home");

        if (!result?.ok) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "تعذر تحميل الباعة"
          );
        }

        const items = Array.isArray(result?.data?.featured_sellers)
          ? result.data.featured_sellers
          : [];

        if (!cancelled) {
          setSellers(items.map(normalizeSeller));
        }
      } catch (err) {
        if (!cancelled) {
          setSellers([]);
          setMessage(err?.message || "حدث خطأ أثناء تحميل الباعة");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSellers();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: sellers.length,
      verified: sellers.filter((s) => Number(s.verified) === 1).length,
      topRated: sellers.filter((s) => Number(s.rating || 0) >= 4.5).length
    };
  }, [sellers]);

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={styles.heroCard}>
          <div className="ui-chip">RAHBA SELLERS</div>
          <h1 className="page-title">باعة رحبة</h1>
          <p className="page-subtitle">
            اكتشف متاجر موثوقة داخل المنصة، تصفح ملفات الباعة، وانتقل مباشرة
            إلى متاجرهم ومنتجاتهم.
          </p>

          <div style={styles.statsGrid}>
            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.total}</strong>
              <span style={styles.statLabel}>باعة ظاهرون</span>
            </div>
            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.verified}</strong>
              <span style={styles.statLabel}>باعة موثقون</span>
            </div>
            <div className="ui-card-soft" style={styles.statCard}>
              <strong style={styles.statValue}>{stats.topRated}</strong>
              <span style={styles.statLabel}>تقييم مرتفع</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ui-card" style={styles.infoCard}>
            جاري تحميل الباعة...
          </div>
        ) : message ? (
          <div className="ui-card" style={styles.errorCard}>
            {message}
          </div>
        ) : !sellers.length ? (
          <div className="ui-card" style={styles.infoCard}>
            لا يوجد باعة ظاهرون حالياً.
          </div>
        ) : (
          <div style={styles.grid}>
            {sellers.map((seller) => (
              <article key={seller.id} style={styles.card}>
                <div style={styles.top}>
                  <div style={styles.avatar}>
                    {seller.logo_url ? (
                      <img
                        src={seller.logo_url}
                        alt={seller.display_name}
                        style={styles.avatarImg}
                      />
                    ) : (
                      seller.display_name.slice(0, 1)
                    )}
                  </div>

                  <div style={styles.topMeta}>
                    <div style={styles.titleRow}>
                      <h3 style={styles.cardTitle}>{seller.display_name}</h3>
                      <span style={styles.statusBadge}>
                        {seller.verified ? "موثّق" : "قيد المراجعة"}
                      </span>
                    </div>

                    <div style={styles.metaRow}>
                      <span>📍 {seller.city}</span>
                      <span style={styles.dot}>·</span>
                      <span>★ {seller.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <p style={styles.description}>{seller.description}</p>

                <div style={styles.actions}>
                  <Link
                    to={seller.slug ? `/sellers/${seller.slug}` : "/sellers"}
                    className="btn btn-primary"
                    style={styles.primaryBtn}
                  >
                    زيارة المتجر
                  </Link>

                  <Link
                    to={seller.slug ? `/products?seller_id=${seller.id}` : "/products"}
                    className="btn btn-secondary"
                    style={styles.secondaryBtn}
                  >
                    تصفح المنتجات
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  heroCard: {
    display: "grid",
    gap: "14px",
    padding: "18px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px"
  },

  statCard: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    textAlign: "center"
  },

  statValue: {
    color: "#173b74",
    fontSize: "20px",
    fontWeight: 900
  },

  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },

  infoCard: {
    padding: "18px",
    textAlign: "center"
  },

  errorCard: {
    padding: "18px",
    textAlign: "center",
    border: "1.5px solid #fecaca",
    color: "#991b1b",
    background: "#fff"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px"
  },

  card: {
    background: "#fff",
    border: "1.5px solid #ddd5c2",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    boxShadow: "0 4px 16px rgba(22,53,107,0.08)"
  },

  top: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "12px",
    alignItems: "center"
  },

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#eef4ff",
    color: "#16356b",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "20px"
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  topMeta: {
    display: "grid",
    gap: "6px"
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap"
  },

  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
    color: "#16356b"
  },

  statusBadge: {
    fontSize: "12px",
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569"
  },

  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "13px",
    flexWrap: "wrap"
  },

  dot: {
    color: "#cbd5e1"
  },

  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.8,
    fontSize: "14px"
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  primaryBtn: {
    justifyContent: "center"
  },

  secondaryBtn: {
    justifyContent: "center"
  }
};
