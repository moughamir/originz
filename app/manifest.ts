import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { env } from "@/lib/env-validation";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: env.NEXT_PUBLIC_STORE_NAME,
    background_color: "#ffffff",
    theme_color: "#336571",
    description: SITE_CONFIG.description,
    dir: "auto",
    display: "standalone",
    lang: "en",
    orientation: "portrait-primary",
    start_url: "/",
    scope: "/",
    id: "jhuangnyc-store",

    icons: [
      {
        purpose: "maskable",
        sizes: "1024x1024",
        src: "maskable_icon.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "48x48",
        src: "maskable_icon_x48.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "72x72",
        src: "maskable_icon_x72.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "96x96",
        src: "maskable_icon_x96.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "128x128",
        src: "maskable_icon_x128.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "maskable_icon_x192.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "384x384",
        src: "maskable_icon_x384.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "maskable_icon_x512.png",
        type: "image/png",
      },
    ],
  };
}
