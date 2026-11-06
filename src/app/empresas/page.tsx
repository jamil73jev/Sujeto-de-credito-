import type { Metadata } from "next";

import { FormularioEmpresa } from "@/components/FormularioEmpresa";
import { FuenteTraza } from "@/components/FuenteTraza";
import { datos } from "@/lib/datos";
import { fuentesInforme } from "@/lib/informe-fuentes";

export const metadata: Metadata = {
  title: "Empresas",
  description: "Indicadores financieros y cumplimiento para empresas de Ecuador, con comparación sectorial cuando haya datos.",
};

export default function PaginaEmpresas() {
  const t = datos.textos;
  const nombresRatio = Object.fromEntries(datos.indicadores.registros.map((i) => [i.id, i.nombre]));

  return (
    <>
      <div className="titular">
        <h1>Empresas</h1>
        <span className="meta">Se calcula en tu navegador. No guardamos nada.</span>
      </div>

      <FormularioEmpresa
        textos={t.resultados}
        errores={t.errores}
        descargoCorto={t.descargo_corto}
        benchmarks={datos.benchmarks.registros}
        nombresRatio={nombresRatio}
        fuentesInforme={fuentesInforme()}
      />

      <section className="mas">
        <h2>Más información</h2>

        <details className="plegable">
          <summary>Qué suelen pedir las entidades</summary>
          <div className="contenido">
            <ul>
              {datos.checklistEmpresas.registros.map((i) => (
                <li key={i.id}>
                  <strong>{i.item}.</strong> {i.descripcion}
                  {i.es_ejemplo_de_entidad ? " (Ejemplo de una entidad.)" : ""} <FuenteTraza traza={i.traza} />
                </li>
              ))}
            </ul>
          </div>
        </details>

        <details className="plegable">
          <summary>Indicadores que calculamos</summary>
          <div className="contenido">
            <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Fórmula</th>
                    <th>Cómo leerlo</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.indicadores.registros.map((i) => (
                    <tr key={i.id}>
                      <td>{i.nombre}</td>
                      <td>{i.formula}</td>
                      <td>
                        {i.interpretacion} {i.regla_general.nota}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="meta">Rotación de activos y días de cobranza son informativos: no hay un umbral general de aprobación. El DSCR cuenta para el nivel solo si ingresas flujo disponible y servicio de la deuda.</p>
          </div>
        </details>

        <details className="plegable">
          <summary>Comparación con tu sector</summary>
          <div className="contenido">
            <p>{datos.benchmarks.nota}</p>
          </div>
        </details>
      </section>
    </>
  );
}
