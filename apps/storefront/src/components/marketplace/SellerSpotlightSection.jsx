import { useMemo } from "react";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import SectionActionLink from "./SectionActionLink";
import { UI } from "./uiTokens";
import { Link } from "react-router-dom";
import { normalizeMarketplaceSellers } from "../../utils/marketplaceSellerMapper";

export default function SellerSpotlightSection({ sellers = [] }) {
  const items = useMemo(
    () => normalizeMarketplaceSellers(sellers),
    [sellers]
  );

  if (!items.length) return null;

  return (
    <SectionShell style={s.shell}>
      <div style={s.headRow}>
        <div style={s.headContent}>
          <SectionHead
            chip="SELLERS"
            title="باعة ومتاجر مميزة"
            subtitle="اكتشف متاجر نشيطة داخل رحبة وابدأ التسوق من بائعين أوضح وأكثر موثوقية."
          />

          <div style={s.metaRow}>
            <span style={s.metaChip}>متاجر نشيطة</span>
            <span style={s.metaChip}>معلومات أوضح</span>
            <span style={s.metaChip}>ثقة أفضل</span>
          </div>
        </div>

        <div style={s.actionWrap}>
          <SectionActionLink to="/sellers">عرض الكل ←</SectionActionLink>
        </div>
      </div>

      <div style={s.grid}>
        {items.map((seller) => (
          <div
            key={seller.id || seller.slug || seller.name}
            style={s.card}
          >
            <div style={s.cardTop}>
              <div style={s.avatar}>
                {String(seller.name || "R").trim().charAt(0).toUpperCase()}
              </div>

              <div style={s.identity}>
                <div style={s.nameRow}>
                  <strong style={s.name}>{seller.name}</strong>
                  {seller.verified ? <span style={s.verified}>موثوق</span> : null}
                </div>

                <div style={s.meta}>
                  {seller.city ? <span>📍 {seller.city}</span> : null}
                  {seller.city ? <span>•</span> : null}
                  <span>⭐ {seller.rating || 0}</span>
                </div>
              </div>
            </div>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <strong style={s.statValue}>{seller.products_count || 0}</strong>
                <span style={s.statLabel}>منتج</span>
              </div>

              <div style={s.statBox}>
                <strong style={s.statValue}>
                  {seller.kyc_status === "approved" || seller.verified ? "نعم" : "—"}
                </strong>
                <span style={s.statLabel}>توثيق</span>
              </div>
            </div>

            <div style={s.cardNote}>
              متجر داخل رحبة مع عرض أوضح للمنتجات والهوية والثقة.
            </div>

            <Link
              to={seller.slug ? `/sellers/${seller.slug}` : "#"}
              style={{
                ...s.storeBtn,
                opacity: seller.slug ? 1 : 0.5,
                pointerEvents: seller.slug ? "auto" : "none",
              }}
            >
              عرض المتجر
            </Link>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

const s = {
  shell: {
    display: "grid",
    gap: "18px",
    background: "linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%)",
    border: `1px solid ${UI.colors.border}`,
    boxShadow: "0 18px 42px rgba(11,15,26,0.05)",
  },

  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    flexWrap: "wrap",
  },

  headContent: {
    display: "grid",
    gap: "12px",
    minWidth: 0,
    flex: "1 1 520px",
  },

  actionWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: "fit-content",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  metaChip: {
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    background: "#ffffff",
    border: `1px solid ${UI.colors.border}`,
    color: UI.colors.navy,
    fontSize: UI.type.caption,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(11,15,26,0.04)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: UI.spacing.cardGap,
  },

  card: {
    padding: UI.spacing.cardPadding,
    display: "grid",
    gap: UI.spacing.cardGap,
    border: `1px solid ${UI.colors.line}`,
    background: "#ffffff",
    borderRadius: UI.radius.xxl,
    boxShadow: "0 12px 28px rgba(11,15,26,0.05)",
  },

  cardTop: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #eef6ff 0%, #eafbf7 100%)",
    color: UI.colors.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "18px",
    flexShrink: 0,
    border: `1px solid ${UI.colors.border}`,
  },

  identity: {
    display: "grid",
    gap: "6px",
    minWidth: 0,
  },

  nameRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  name: {
    color: UI.colors.ink,
    fontSize: "16px",
    lineHeight: 1.5,
  },

  verified: {
    padding: "4px 8px",
    borderRadius: UI.radius.pill,
    background: UI.colors.successBg,
    color: UI.colors.successText,
    border: `1px solid ${UI.colors.successBorder}`,
    fontSize: "11px",
    fontWeight: 900,
  },

  meta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700,
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  statBox: {
    display: "grid",
    gap: "4px",
    padding: "10px",
    borderRadius: UI.radius.lg,
    background: UI.colors.softBg,
    border: `1px solid ${UI.colors.line}`,
    textAlign: "center",
  },

  statValue: {
    color: UI.colors.navy,
    fontSize: "16px",
    fontWeight: 900,
  },

  statLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700,
  },

  cardNote: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    lineHeight: 1.8,
  },

  storeBtn: {
    textDecoration: "none",
    textAlign: "center",
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: UI.radius.lg,
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 100%)",
    color: "#ffffff",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(13,44,84,0.14)",
  },
};
