import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { datos } from "@/lib/datos";
import { Navegacion } from "@/components/Navegacion";
import {
  CONTACTO_EMAIL,
  ES_BETA,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "es_EC",
    type: "website",
  },
  robots: ES_BETA
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-EC">
      <body>
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <header className="cabecera">
          {ES_BETA ? (
            <p className="banner-beta">
              <strong>Versión de prueba.</strong> Puede tener errores.{" "}
              <Link href="/comentarios">Cuéntanos qué mejorar</Link>.
            </p>
          ) : null}
          <div className="contenedor">
            <Link className="marca" href="/">
              Listo para Crédito
            </Link>
            <Navegacion />
          </div>
        </header>
        <main id="contenido" tabIndex={-1} className="contenedor">
          {children}
        </main>
        <footer className="pie">
          <div className="contenedor">
            <p>{datos.textos.descargo_corto}</p>
            <div className="enlaces">
              <Link href="/privacidad">Privacidad</Link>
              <Link href="/terminos">Términos</Link>
              <Link href="/comentarios">Comentarios</Link>
              {CONTACTO_EMAIL ? (
                <a href={`mailto:${CONTACTO_EMAIL}`}>Contacto</a>
              ) : null}
            </div>
            <details>
              <summary>Aviso completo</summary>
              <p>{datos.textos.descargo}</p>
              <p>{datos.textos.privacidad}</p>
            </details>
          </div>
        </footer>
      </body>
    </html>
  );
}
