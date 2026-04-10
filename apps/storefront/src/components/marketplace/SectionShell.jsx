import { UI } from "./uiTokens";

export default function SectionShell({ children, style = {}, className = "ui-card", dir = "rtl" }) {
  return (
    <section
      dir={dir}
      className={className}
      style={{
        display: "grid",
        gap: UI.spacing.sectionGap,
        padding: UI.spacing.shellPadding,
        border: `1px solid ${UI.colors.line}`,
        background: UI.colors.white,
        borderRadius: UI.radius.xxl,
        boxShadow: UI.shadow.soft,
        ...style
      }}
    >
      {children}
    </section>
  );
}
