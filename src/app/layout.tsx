import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DELOUS '26 — Olasubulumi & Dare | 28 November 2026",
  description:
    "The union of two families, the celebration of a lifetime. Join Olasubulumi Adesola & Dare Samuel on Saturday, 28 November 2026 in Lagos. Ẹ káàbọ̀!",
  openGraph: {
    title: "DELOUS '26 — Olasubulumi & Dare",
    description:
      "A royal celebration of love, culture and legacy. 28 November 2026, Lagos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
