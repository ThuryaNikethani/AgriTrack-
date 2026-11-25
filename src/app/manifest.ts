import type { MetadataRoute } from "next";

/** Web app manifest: lets AgriTrack be installed on phones ("Add to Home screen"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgriTrack - Athukorala Group",
    short_name: "AgriTrack",
    description: "Kurunduwatta polytunnel management - crops, harvests, fertilizer, sales and reports.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f5ef",
    theme_color: "#164222",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
