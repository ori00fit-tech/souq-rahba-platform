import { UI } from "./uiTokens";

export default function SectionShell({ children, style = {}, className = "", dir = "rtl", variant = "default" }) {
  const variantStyles = {
    default: {
      background: UI.colors.surface,
      border: `1px solid ${UI.colors.border}`,
    },
    elevated: {
      background: UI.colors.bgElevated,
      border: `1px solid ${UI.colors.border}`,
    },
    transparent: {
      background: "transparent",
      border: "none",
    },
    accent: {
      background: UI.colors.surface,
      border: `1px solid ${UI.colors.borderAccent}`,
    }
  };

  return (
    <section
      dir={dir}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: UI.spacing.xl,
        padding: UI.spacing.lg,
        borderRadius: UI.radius.lg,
        ...variantStyles[variant],
        ...style
      }}
    >
      {children}
    </section>
  );
}
