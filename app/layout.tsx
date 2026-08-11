import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { WEDDING } from "@/lib/wedding";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${WEDDING.couple} — ${WEDDING.dateShort}`,
    template: `%s | ${WEDDING.couple}`,
  },
  description: `${WEDDING.couple} are getting married on ${WEDDING.dateLong} at ${WEDDING.venue} in ${WEDDING.venueLocation}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
