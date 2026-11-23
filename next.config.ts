import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Report generators run on the Node.js server only.
  serverExternalPackages: ["@react-pdf/renderer", "exceljs"],
};

export default nextConfig;
