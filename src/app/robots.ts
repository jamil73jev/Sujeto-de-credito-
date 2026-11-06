import type { MetadataRoute } from "next";

import { ES_BETA, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ES_BETA ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
