import type { Metadata } from "next";
import Link from "next/link";

import { datos } from "@/lib/datos";
import { CONTACTO_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos",
  description: "Alcance y límites de esta herramienta orientativa: no es un buró, no aprueba créditos y no sustituye a una entidad financiera.",
};

export default function PaginaTerminos() {
  return (
    <>
      <div className="titular">
        <h1>Términos</h1>
        <span className="meta">Herramienta orientativa, no un servicio financiero.</span>
      </div>

      <div className="rejilla">
        <article className="tarjeta">
          <h2>Qué no es</h2>
          <ul>
            <li>No es un buró ni una fuente de información crediticia.</li>
            <li>No emite scores, preaprobaciones ni ofertas.</li>
            <li>No da asesoría financiera, legal ni tributaria.</li>
            <li>No está vinculada a entidades financieras ni de control.</li>
          </ul>
        </article>
        <article className="tarjeta">
          <h2>Tu responsabilidad</h2>
          <ul>
            <li>El resultado depende de los datos que ingresas.</li>
            <li>
              Verifica en los <Link href="/verificaciones">canales oficiales</Link> antes de decidir.
            </li>
            <li>No uses el sitio para evaluar a terceros sin su autorización.</li>
          </ul>
        </article>
      </div>

      <details className="plegable" style={{ marginTop: "0.75rem" }}>
        <summary>Datos, fuentes y responsabilidad</summary>
        <div className="contenido">
          <p>{datos.textos.descargo}</p>
          <p>
            Las tasas, la normativa y los requisitos de entidades se muestran con su fuente, fecha y confianza, y pueden cambiar o tener errores. Los
            parámetros sin respaldo oficial son supuestos del proyecto (ver <Link href="/metodologia">metodología</Link>). El sitio se ofrece tal cual; sus
            responsables no responden por decisiones tomadas con estimaciones orientativas, en la medida que permita la ley ecuatoriana.
          </p>
          <p>
            Contacto:{" "}
            {CONTACTO_EMAIL ? <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a> : "el correo aún no está configurado."}
          </p>
        </div>
      </details>
    </>
  );
}
