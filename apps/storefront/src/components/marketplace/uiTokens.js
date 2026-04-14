/**
 * RAHBA MARKETPLACE — Design Tokens
 * Dark Premium Theme with Gold/Teal Accents
 * Mobile-first, RTL Arabic-first
 */

export const UI = {
  colors: {
    // Base Surfaces
    bgDeep: "#0a0d14",
    bg: "#0f1219",
    bgElevated: "#151a24",
    surface: "#1a202e",
    surfaceHover: "#212938",
    surfaceActive: "#2a3344",

    // Text Hierarchy
    text: "#f4f4f5",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    textSoft: "#52525b",

    // Borders
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    borderAccent: "rgba(212, 175, 55, 0.3)",

    // Primary — Deep Blue
    primary: "#2563eb",
    primaryHover: "#3b82f6",
    primaryMuted: "rgba(37, 99, 235, 0.15)",

    // Accent — Premium Gold
    accent: "#d4af37",
    accentHover: "#e5c158",
    accentMuted: "rgba(212, 175, 55, 0.12)",

    // Secondary — Teal
    teal: "#14b8a6",
    tealHover: "#2dd4bf",
    tealMuted: "rgba(20, 184, 166, 0.12)",

    // Status
    success: "#22c55e",
    successBg: "rgba(34, 197, 94, 0.1)",
    successBorder: "rgba(34, 197, 94, 0.25)",

    warning: "#f59e0b",
    warningBg: "rgba(245, 158, 11, 0.1)",
    warningBorder: "rgba(245, 158, 11, 0.25)",

    error: "#ef4444",
    errorBg: "rgba(239, 68, 68, 0.1)",
    errorBorder: "rgba(239, 68, 68, 0.25)",

    // Overlays
    overlay: "rgba(10, 13, 20, 0.8)",
    overlayLight: "rgba(10, 13, 20, 0.6)",
  },

  radius: {
    xs: "6px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    pill: "999px",
  },

  shadow: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.25)",
    md: "0 4px 16px rgba(0, 0, 0, 0.3)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.4)",
    glow: "0 0 20px rgba(212, 175, 55, 0.15)",
    glowTeal: "0 0 20px rgba(20, 184, 166, 0.15)",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    section: "24px",
    cardGap: "12px",
    pagePadding: "16px",
  },

  type: {
    hero: "clamp(1.75rem, 4vw, 2.5rem)",
    titleLg: "24px",
    titleMd: "20px",
    titleSm: "16px",
    body: "14px",
    bodySm: "13px",
    caption: "12px",
    micro: "11px",
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1200px",
  },

  transitions: {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease",
  },
};

// Semantic color mappings for common use cases
export const semanticColors = {
  // Prices
  price: UI.colors.accent,
  priceOld: UI.colors.textMuted,
  priceSale: UI.colors.error,

  // Trust indicators
  verified: UI.colors.teal,
  rating: UI.colors.accent,
  inStock: UI.colors.success,
  lowStock: UI.colors.warning,
  outOfStock: UI.colors.error,

  // Interactive
  link: UI.colors.primary,
  linkHover: UI.colors.primaryHover,

  // Seller trust levels
  sellerNew: UI.colors.textMuted,
  sellerTrusted: UI.colors.teal,
  sellerPremium: UI.colors.accent,
};

// Common component styles
export const componentStyles = {
  card: {
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.lg,
  },

  cardHover: {
    borderColor: UI.colors.borderStrong,
    transform: "translateY(-2px)",
  },

  input: {
    background: UI.colors.bgElevated,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    color: UI.colors.text,
    minHeight: "48px",
    padding: "12px 16px",
  },

  inputFocus: {
    borderColor: UI.colors.primary,
    boxShadow: `0 0 0 3px ${UI.colors.primaryMuted}`,
  },

  buttonPrimary: {
    background: UI.colors.primary,
    color: "#fff",
    borderRadius: UI.radius.md,
    minHeight: "44px",
  },

  buttonAccent: {
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    borderRadius: UI.radius.md,
    minHeight: "44px",
  },

  buttonSecondary: {
    background: UI.colors.surfaceHover,
    color: UI.colors.text,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    minHeight: "44px",
  },
};
