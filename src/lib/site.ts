export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
/** Correo para dudas y ejercicio de derechos (LOPDP). Se puede sustituir con NEXT_PUBLIC_CONTACT_EMAIL. */
export const CONTACTO_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "thundertech73@gmail.com";
/** Versión de prueba: no se indexa y muestra un aviso. Se apaga (NEXT_PUBLIC_BETA=0 o sin definir) al lanzar. */
export const ES_BETA = process.env.NEXT_PUBLIC_BETA === "1";
export const SITE_NAME = "¿Soy sujeto de crédito? Ecuador";
export const SITE_DESCRIPTION =
  "Autoevaluación orientativa, gratuita y sin registro para personas y empresas de Ecuador: qué miran las entidades, y cómo verificar tu historial en canales oficiales.";

export const RUTAS = [
  { href: "/personas", etiqueta: "Personas" },
  { href: "/empresas", etiqueta: "Empresas" },
  { href: "/verificaciones", etiqueta: "Verificar" },
  { href: "/metodologia", etiqueta: "Metodología" },
] as const;
