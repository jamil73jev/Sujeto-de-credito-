import { cabecerasSeguridad } from "./security-headers.mjs";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: cabecerasSeguridad(isProd) }];
  },
};

export default nextConfig;
