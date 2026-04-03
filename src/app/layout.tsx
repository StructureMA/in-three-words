import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "In a Few Words — Original Art for a Cause",
  description:
    "Tell me 2–4 words. I'll paint you a painting. Each week, one stranger is selected. A portion goes to charity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
