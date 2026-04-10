import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import { UI } from "../components/marketplace/uiTokens";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

function normalizeSeller(seller) {
  return {
    id: seller?.id || "",
    slug: seller?.slug || "",
    display_name: seller?.display_name || seller?.name || "متجر بدون اسم",
    city: seller?.city || "المغرب",
    verified: Number(seller?.verified || 0),
    kyc_status: seller?.kyc_status || "pending",
    rating: Number(seller?.rating || 0),
    logo_url: resolveImageUrl(seller?.logo_url || ""),
    description:
      seller?.description ||
      "بائع موثوق داخل منصة رحبة مع منتجات جاهزة للتصفح والطلب."
  };
}

function getApiErrorMessage(result, fallback = "تعذر تحميل الباعة") {
  return result?.error?.message || result?.message || fallback;
}

export default function SellersPage() {
  const requestIdRef = useRef(0);

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadSellers() {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setMessage("");

      const result = await apiGet("/catalog/home");

      if (requestId !== requestIdRef.current) return;

      if (!result?.ok) {
        setSellers([]);
        setMessage(getApiErrorMessage(result, "تعذر تحميل الباعة"));
        return;
      }

      const items = Array.isArray(result?.data?.featured_sellers)
        ? result.data.featured_sellers
        : [];

      setSellers(items.map(normalizeSeller));
    } catch (err) {
      console.error(err);
      if (requestId !== requestIdRef.current) return;
      setSellers([]);
      setMessage("حدث خطأ أثناء تحميل الباعة");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadSellers();
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
      <div style={styles.stack}>
        <SectionShell style={styles.heroShell}>
          <div className="ui-chip">RAHBA SELLERS</div>
          <SectionHead
            title="باعة رحبة"
            subtitle="اكتشف متاجر موثوقة داخل المنصة، تصفح ملفات الباعة، وانتقل مباشرة إلى متاجرهم ومنتجاتهم."
          />

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
        </SectionShell>

        <div style={styles.topActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadSellers}
            disabled={loading}
          >
            {loading ? "جاري التحديث..." : "تحديث الباعة"}
          </button>
        </div>

        {loading ? (
          <SectionShell>
            <div style={styles.stateBox}>جاري تحميل الباعة...</div>
          </SectionShell>
        ) : message ? (
          <SectionShell style={styles.errorShell}>
            <div style={styles.errorBox}>{message}</div>
          </SectionShell>
        ) : !sellers.length ? (
          <SectionShell>
            <div style={styles.stateBox}>لا يوجد باعة ظاهرون حالياً.</div>
          </SectionShell>
        ) : (
          <SectionShell>
            <SectionHead
              chip="SELLERS DIRECTORY"
              title="تصفح الباعة"
              subtitle="اختر البائع المناسب وادخل إلى متجره لمعاينة المنتجات والتفاصيل."
            />

            <div style={styles.grid}>
              {sellers.map((seller) => (
                <article key={seller.id || seller.slug} style={styles.card}>
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

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(seller.verified ? styles.statusVerified : styles.statusPending)
                          }}
                        >
                          {seller.verified ? "موثّق" : "قيد المراجعة"}
                        </span>
                      </div>

                      <div style={styles.metaRow}>
                        <span>📍 {seller.city}</span>
                        <span style={styles.dot}>•</span>
                        <span>★ {Number(seller.rating || 0).toFixed(1)}</span>
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
                      to={seller.id ? `/products?seller_id=${seller.id}` : "/products"}
                      className="btn btn-secondary"
                      style={styles.secondaryBtn}
                    >
                      تصفح المنتجات
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </SectionShell>
        )}

        <SectionShell>
          <div className="ui-card-soft" style={styles.noteCard}>
            <strong style={styles.noteTitle}>ملاحظة</strong>
            <span style={styles.noteText}>
              هذه الصفحة تعرض حالياً الباعة المميزين أو الظاهرين في الصفحة الرئيسية.
              يمكن لاحقاً ربطها بمسار مخصص لعرض جميع الباعة بشكل كامل.
            </span>
          </div>
        </SectionShell>
      </div>
    </section>
  );
}

const styles = {
  stack: {
    display: "grid",
    gap: "26px"
  },

  heroShell: {
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.06) 0%, rgba(20,184,166,0.06) 100%)",
    border: "1px solid #dfe7f3"
  },

  topActions: {
    display: "flex",
    justifyContent: "flex-start"
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
    color: UI.colors.navy,
    fontSize: "20px",
    fontWeight: 900
  },

  statLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  stateBox: {
    padding: "18px",
    textAlign: "center",
    color: UI.colors.muted,
    fontWeight: 700
  },

  errorShell: {
    border: `1.5px solid ${UI.colors.dangerBorder}`,
    background: "#fff"
  },

  errorBox: {
    padding: "18px",
    textAlign: "center",
    color: UI.colors.dangerText,
    fontWeight: 800
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: UI.spacing.cardGap
  },

  card: {
    background: UI.colors.white,
    border: `1.5px solid ${UI.colors.border}`,
    borderRadius: UI.radius.xl,
    padding: UI.spacing.shellPadding,
    display: "grid",
    gap: UI.spacing.cardGap,
    boxShadow: UI.shadow.soft
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
    borderRadius: UI.radius.lg,
    overflow: "hidden",
    background: UI.colors.softBlue,
    color: UI.colors.navy,
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
    fontSize: UI.type.titleSm,
    fontWeight: 900,
    color: UI.colors.navy
  },

  statusBadge: {
    fontSize: UI.type.caption,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: UI.radius.pill
  },

  statusVerified: {
    background: UI.colors.successBg,
    border: `1px solid ${UI.colors.successBorder}`,
    color: UI.colors.successText
  },

  statusPending: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569"
  },

  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    flexWrap: "wrap"
  },

  dot: {
    color: "#cbd5e1"
  },

  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.8,
    fontSize: UI.type.body
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
  },

  noteCard: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },

  noteTitle: {
    color: UI.colors.navy
  },

  noteText: {
    color: UI.colors.muted,
    lineHeight: 1.8
  }
};
