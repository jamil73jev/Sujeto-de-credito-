// Cabeceras de seguridad del sitio. Viven aparte de next.config.mjs para poder probarlas.
//
// CSP: estricta salvo lo que Next necesita para hidratar (scripts y estilos en línea). No se cargan scripts,
// fuentes ni imágenes de terceros. Si agregas analítica o fuentes externas, actualiza esta política y /privacidad.
// Pendiente de endurecer: reemplazar 'unsafe-inline' por nonces exige renderizado dinámico y se evalúa tras el lanzamiento.
//
// HSTS: sin «preload» ni «includeSubDomains» hasta tener el dominio definitivo; la lista de precarga es difícil de revertir.

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** @param {boolean} produccion */
export function cabecerasSeguridad(produccion) {
  const base = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];
  if (produccion) {
    base.push({ key: "Strict-Transport-Security", value: "max-age=63072000" }, { key: "Content-Security-Policy", value: CSP });
  }
  return base;
}
