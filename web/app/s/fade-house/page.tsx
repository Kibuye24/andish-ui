import type { Metadata } from "next";
import FadeHouseSite from "@/components/site/FadeHouseSite";
import "./site.css";

export const metadata: Metadata = {
  title: "Fade House",
  description: "Barbershop in Nairobi. Book a chair online and shop grooming products.",
};

export default function FadeHousePage() {
  return <FadeHouseSite />;
}
