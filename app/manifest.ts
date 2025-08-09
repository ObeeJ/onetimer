import type { MetadataRoute } from "next"
import { APP_DESCRIPTION } from "@/utils/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OneTime Survey",
    short_name: "OneTime",
    description: APP_DESCRIPTION,
    start_url: "/filler",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
