import type { Metadata } from "next";

import { datos } from "@/lib/datos";
import { CONTACTO_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos trata este sitio (ninguno se almacena) y qué no hace.",
};

export default function PaginaPrivacidad() {
  const lopdp = datos.normativa.registros.find((n) => n.id === "lopdp");
  return (
    <>
      <div className="titular">
        <h1>Privacidad</h1>
        <span className="meta">Lo que escribes se queda en tu navegador.</span>
      </div>

      <div className="rejilla">
        <article className="tarjeta">
          <h2>Qué hacemos</h2>
          <ul>
            <li>Procesamos tus datos solo en tu navegador.</li>
            <li>No los enviamos, guardamos ni compartimos.</li>
            <li>No hay cuentas, cookies de seguimiento ni analítica.</li>
            <li>No cargamos scripts, tipografías ni imágenes de terceros.</li>
          </ul>
        </article>
        <article className="tarjeta">
          <h2>Qué no hacemos</h2>
          <ul>
            <li>No consultamos burós, SRI ni superintendencias.</li>
            <li>No mostramos datos de otras personas o empresas.</li>
            <li>No emitimos calificaciones oficiales ni aprobamos créditos.</li>
          </ul>
        </article>
      </div>

      <details className="plegable" style={{ marginTop: "0.75rem" }}>
        <summary>Tus derechos y el marco legal</summary>
        <div className="contenido">
          <p>
            Como no almacenamos tus datos, aquí no hay información tuya que acceder, rectificar o eliminar. Esos derechos se ejercen ante quien sí
            la tiene, por ejemplo la entidad que reportó tu información a un buró.{" "}
            {CONTACTO_EMAIL ? <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a> : "El correo de contacto aún no está configurado."}
          </p>
          <p>
            El tratamiento de datos personales en Ecuador se rige por la Ley Orgánica de Protección de Datos Personales y su reglamento.
            {lopdp ? (
              <>
                {" "}
                <a href={lopdp.url} target="_blank" rel="noopener noreferrer">
                  Texto de la ley
                </a>
                .
              </>
            ) : null}{" "}
            Si nos escribes al correo de contacto, usamos tu mensaje y tu dirección solo para responderte; no los compartimos ni los usamos para otros fines, y
            puedes pedir que los borremos. El proveedor de alojamiento puede registrar datos técnicos de la conexión (como la dirección IP) por seguridad y
            funcionamiento. Si el sitio incorpora analítica o almacenamiento, esta política se actualizará antes de activarlos.
          </p>
        </div>
      </details>
    </>
  );
}
