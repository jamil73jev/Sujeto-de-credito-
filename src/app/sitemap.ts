import type { MetadataRoute } from "next";

import { ES_BETA, RUTAS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (ES_BETA) return [];
  const rutas = ["/", ...RUTAS.map((r) => r.href), "/comentarios", "/privacidad", "/terminos"];
  return rutas.map((ruta) => ({ url: new URL(ruta, SITE_URL).toString() }));
}
