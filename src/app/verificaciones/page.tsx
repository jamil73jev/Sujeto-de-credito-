import type { Metadata } from "next";

import { FuenteTraza } from "@/components/FuenteTraza";
import { datos } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Verificar en canales oficiales",
  description: "Dónde consultar tu reporte de crédito, deudas con el SRI y certificados, en canales oficiales.",
};

export default function PaginaVerificaciones() {
  return (
    <>
      <div className="titular">
        <h1>Verificar</h1>
        <span className="meta">Tu historial solo lo ves tú, en los canales oficiales.</span>
      </div>

      <div className="rejilla">
        {datos.verificaciones.registros.map((v) => (
          <article className="tarjeta" key={v.id}>
            <h2>{v.servicio}</h2>
            <p className="meta">
              {v.entidad} · {v.costo ?? "Verifica el costo en el sitio oficial"}
            </p>
            <p>{v.que_muestra}</p>
            {v.requisitos.length > 0 || v.pasos.length > 0 ? (
              <details className="plegable">
                <summary>Requisitos y pasos</summary>
                <div className="contenido">
                  {v.requisitos.length > 0 ? (
                    <ul>
                      {v.requisitos.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  ) : null}
                  {v.pasos.length > 0 ? (
                    <ol>
                      {v.pasos.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ol>
                  ) : null}
                  <p className="meta">
                    <strong>Quién consulta:</strong> {v.quien_puede_consultar}
                  </p>
                  <FuenteTraza traza={v.traza} />
                </div>
              </details>
            ) : null}
            {v.url ? (
              <a className="boton" href={v.url} target="_blank" rel="noopener noreferrer">
                Ir al sitio oficial
              </a>
            ) : (
              <span className="etiqueta warn">Enlace pendiente de confirmar</span>
            )}
          </article>
        ))}
      </div>

      <details className="plegable" style={{ marginTop: "0.75rem" }}>
        <summary>Sobre los burós autorizados y los precios</summary>
        <div className="contenido">
          <p>
            Equifax, Dataexperto (Aval Buró) y RedClic aparecen en circulares oficiales de 2021 o en sus propios sitios. No hay una nómina pública
            actualizada: confirma con la Superintendencia de Bancos que el prestador tenga autorización vigente. Los precios cambian; verifícalos antes
            de pagar.
          </p>
        </div>
      </details>

      <section className="mas" id="alertas">
        <h2>Alertas de estafas</h2>
        <div className="rejilla">
          {datos.alertas.registros.map((a) => (
            <details className="plegable" key={a.id}>
              <summary>{a.titulo}</summary>
              <div className="contenido">
                <p>{a.descripcion}</p>
                <strong>Cómo reconocerla</strong>
                <ul>
                  {a.como_reconocerla.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <strong>Qué hacer</strong>
                <ul>
                  {a.que_hacer.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <FuenteTraza traza={a.traza} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
