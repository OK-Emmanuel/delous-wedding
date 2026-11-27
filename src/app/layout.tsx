import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
