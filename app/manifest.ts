import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaultix",
    short_name: "Vaultix",
    description:
      "AI-powered security questionnaire automation with citations, confidence scoring, and audit trails.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    icons: [
      {
        src: "/logo.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
