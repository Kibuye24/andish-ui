import { Barlow_Condensed } from "next/font/google";
import type { ReactNode } from "react";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Example sites that the studio shows as "your site".
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <div className={barlow.variable}>{children}</div>;
}
