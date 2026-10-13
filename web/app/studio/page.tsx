import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";
import "./studio.css";
import "./studio-mobile.css";

export const metadata: Metadata = {
  title: "Andishi studio",
  description: "A prototype of the workspace studio, with example data.",
};

export default function StudioPage() {
  return <StudioApp />;
}
