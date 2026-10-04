import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Samuel System 7 — Samuel Zhang",
    short_name: "Samuel System 7",
    description:
      "My interactive System 7 portfolio: applied AI, product building, research, and coverd.ai.",
    start_url: "/",
    display: "standalone",
    background_color: "#8587a8",
    theme_color: "#f4f1e8",
    orientation: "any",
    categories: ["portfolio", "business", "education"],
    icons: [
      {
        src: "/icon-192.png?v=5",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png?v=5",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png?v=5",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
