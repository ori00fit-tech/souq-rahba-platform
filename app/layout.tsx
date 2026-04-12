import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rahba | Premium Marketplace",
  description:
    "Morocco's premier marketplace. Discover quality products from trusted sellers with fast delivery across Morocco.",
  keywords: [
    "marketplace",
    "Morocco",
    "e-commerce",
    "shopping",
    "Rahba",
    "online store",
  ],
  authors: [{ name: "Rahba" }],
  openGraph: {
    title: "Rahba | Premium Marketplace",
    description:
      "Morocco's premier marketplace. Discover quality products from trusted sellers.",
    type: "website",
    locale: "fr_MA",
    alternateLocale: ["ar_MA", "en_US"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
