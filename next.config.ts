import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Report generators run on the Node.js server only.
  serverExternalPackages: ["@react-pdf/renderer", "exceljs"],
  // The PDF report embeds the company logo, so ship it with the report function.
  outputFileTracingIncludes: {
    "/api/reports/[format]": ["./public/athukorala-logo.png"],
  },
};

export default nextConfig;
