import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";
import "../studio.css";
import "../studio-mobile.css";

export const metadata: Metadata = {
  title: "Andishi mobile app",
  description: "The mobile app design for the studio, shown in a phone frame on wide screens.",
};

// Always the mobile app design. On a computer it sits in a phone frame.
export default function StudioMobilePage() {
  return (
    <div className="s-device">
      <StudioApp forceMobile />
    </div>
  );
}
