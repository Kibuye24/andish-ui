import type { Metadata } from "next";
import { Geist, Sora } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Andishi",
  description:
    "One account for your website, your online store and your back office. Describe your business to the AI builder and land in a working studio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
