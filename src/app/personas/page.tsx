import type { Metadata } from "next";

import { FormularioPersona } from "@/components/FormularioPersona";
import { FuenteTraza } from "@/components/FuenteTraza";
import { datos } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Personas",
  description: "Estimación orientativa para personas naturales: capacidad de pago, historial declarado, resiliencia y documentos.",
};

/** Ítems del checklist que son documentos que el usuario puede reunir. */
const IDS_DOCUMENTOS = ["cedula", "ingresos-comprobables", "respaldos-ingresos"];

export default function PaginaPersonas() {
  const t = datos.textos;
  const consumo = datos.segmentos.registros.find((s) => s.id === "consumo");
  const documentos = datos.checklistPersonas.registros
    .filter((i) => IDS_DOCUMENTOS.includes(i.id))
    .map((i) => ({ id: i.id, etiqueta: i.item }));

  return (
    <>
      <div className="titular">
        <h1>Personas</h1>
        <span className="meta">Se calcula en tu navegador. No guardamos nada.</span>
      </div>

      <FormularioPersona
        textos={t.resultados}
        errores={t.errores}
        descargoCorto={t.descargo_corto}
        tasaConsumoPct={consumo?.tasa_referencial_pct ?? null}
        documentos={documentos}
      />

      <section className="mas">
        <h2>Más información</h2>

        <details className="plegable">
          <summary>Qué suelen pedir las entidades</summary>
          <div className="contenido">
            <ul>
              {datos.checklistPersonas.registros.map((i) => (
                <li key={i.id}>
                  <strong>{i.item}.</strong> {i.descripcion}
                  {i.es_ejemplo_de_entidad ? " (Ejemplo de una entidad.)" : ""} <FuenteTraza traza={i.traza} />
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className="plegable">
          <summary>Requisitos publicados por entidades concretas</summary>
          <div className="contenido">
            <p className="meta">No son reglas generales: otra entidad puede pedir algo distinto.</p>
            <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
              <table>
                <thead>
                  <tr>
                    <th>Entidad y producto</th>
                    <th>Qué publican</th>
                    <th>No inferir</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.requisitos.registros.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.entidad}</strong>
                        <br />
                        {r.producto}
                      </td>
                      <td>
                        {r.requisito_publicado}{" "}
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          Ver
                        </a>
                      </td>
                      <td>{r.no_inferir}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <details className="plegable">
          <summary>Qué significa el score</summary>
          <div className="contenido">
            <p>{datos.bandas.nota}</p>
            <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
              <table>
                <thead>
                  <tr>
                    <th>Rango</th>
                    <th>Etiqueta</th>
                  </tr>
                </thead>
                <tbody>
                  {[...datos.bandas.bandas]
                    .sort((a, b) => b.desde - a.desde)
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          {b.desde} a {b.hasta}
                        </td>
                        <td>{b.etiqueta}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <ul>
              {datos.bandas.referencias.map((r) => (
                <li key={r.id}>
                  {r.descripcion} <FuenteTraza traza={r.traza} />
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className="plegable">
          <summary>Hábitos que influyen en tu score</summary>
          <div className="contenido">
            <ul>
              {datos.habitos.registros.map((h) => (
                <li key={h.id}>
                  <strong>{h.habito}.</strong> {h.detalle}
                </li>
              ))}
            </ul>
            <FuenteTraza traza={datos.habitos.registros[0]!.traza} />
          </div>
        </details>
      </section>
    </>
  );
}
