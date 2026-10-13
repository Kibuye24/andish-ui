import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi load the dev server by this Mac's address.
  allowedDevOrigins: ["192.168.1.7", "192.168.*.*"],
  // The floating Next.js badge sits on top of the prototype's own buttons.
  devIndicators: false,
};

export default nextConfig;
