import type { Metadata } from "next";

import { FuenteTraza } from "@/components/FuenteTraza";
import { datos } from "@/lib/datos";
import { CASOS_DE_REFERENCIA, ETIQUETA_ORIGEN, METODOLOGIA, REGLAS_GENERALES, REGLAS_METODOLOGIA, REGLA_NIVEL } from "@/lib/metodologia";
import { MUESTRA_MINIMA_BENCHMARK } from "@/lib/parametros";

export const metadata: Metadata = {
  title: "Metodología y fuentes",
  description: "Cómo se calculan las estimaciones, qué parámetros usan, de dónde salen los datos y qué límites tienen.",
};

export default function PaginaMetodologia() {
  return (
    <>
      <div className="titular">
        <h1>Metodología</h1>
        <span className="meta">Cómo se calcula, de dónde salen los datos y qué límites tienen.</span>
      </div>

      <details className="plegable">
        <summary>Cómo se calcula el resultado</summary>
        <div className="contenido">
      <p>
        Cada criterio recibe un estado: <em>cumple</em>, <em>atención</em>, <em>no cumple</em> o <em>sin dato</em>. El resultado global es:
      </p>
      <ul>
        <li>
          <strong>Débil</strong> si algún criterio no se cumple.
        </li>
        <li>
          <strong>Condicionado</strong> si ninguno falla pero alguno requiere atención.
        </li>
        <li>
          <strong>Favorable</strong> si todos los criterios con datos se cumplen.
        </li>
        <li>
          <strong>Insuficiente</strong> si faltan datos obligatorios o son inconsistentes (por ejemplo, un balance que no cuadra).
        </li>
      </ul>
      <p>Los datos que ingresas se procesan en tu navegador; no se envían ni se guardan.</p>
      <p>
        Los criterios se agrupan en dimensiones, en lugar de resumirse en un solo puntaje:
      </p>
      <ul>
        <li>
          <strong>Personas:</strong> elegibilidad, capacidad de pago, historial declarado, resiliencia (prueba de estrés) y documentos.
        </li>
        <li>
          <strong>Empresas:</strong> liquidez, solvencia, rentabilidad y cumplimiento.
        </li>
      </ul>
      <p>
        La prueba de estrés (caída de ingresos y aumento de cuotas) solo puede llevar a <em>atención</em>, nunca a <em>no cumple</em>. La
        lista de documentos <em>informa</em> pero no cambia el nivel: son señales de preparación, no requisitos. Un valor exactamente
        igual al límite (por ejemplo, cuotas de 30 % cuando el máximo es 30 %) queda en <em>atención</em>. El ingreso disponible usa los gastos esenciales que declaras; si no
        los ingresas, ese criterio queda <em>sin dato</em> y no penaliza.
      </p>
      <p>
        Simplificaciones: los indicadores de empresa usan el saldo de cierre; los promedios de saldos solo se calculan si ingresas el año anterior (opcional). Los días de cobranza se calculan como cuentas
        por cobrar entre ventas por 365. La cobertura de la deuda (DSCR) solo se calcula si ingresas flujo disponible y servicio de la deuda; su referencia de 1,2 es un supuesto del proyecto, aprobado por el analista, y sí cuenta para el nivel: más de 1,2 cumple, de 1,0 a 1,2 es atención y menos de 1,0 no cumple.
      </p>
        </div>
      </details>

      <details className="plegable">
        <summary>Comparación con tu sector</summary>
        <div className="contenido">
      <p>
        La comparación sectorial usará percentiles (p10, p25, mediana, p75 y p90) por actividad (CIIU), tamaño y año, calculados a partir
        de balances publicados por la Superintendencia de Compañías. Una celda solo se publica con al menos {MUESTRA_MINIMA_BENCHMARK}{" "}
        empresas válidas; si no alcanza, se agrega a un nivel de actividad superior. Mientras no haya datos calculados con su fuente y
        licencia confirmadas, la comparación aparece como <em>no disponible</em>: no usamos valores de ejemplo.
      </p>
        </div>
      </details>

      <details className="plegable" id="reglas">
        <summary>
          Reglas y umbrales (v{METODOLOGIA.version})
        </summary>
        <div className="contenido">
          <div className="aviso atencion">
            <strong>Versión {METODOLOGIA.version}, {METODOLOGIA.estado}.</strong> {REGLAS_METODOLOGIA.every((r) => r.aprobado) ? `Los ${REGLAS_METODOLOGIA.length} umbrales están aprobados por el analista responsable.` : `${REGLAS_METODOLOGIA.filter((r) => r.aprobado).length} de ${REGLAS_METODOLOGIA.length} umbrales están aprobados por el analista responsable; el resto sigue pendiente y así se indica en cada fila.`} En Ecuador no
            hay un límite oficial general de cuotas sobre ingreso ni de razones financieras para conceder crédito: cada entidad fija el suyo. Por eso
            cada fila indica su origen. Los cálculos se contrastan con {CASOS_DE_REFERENCIA} casos de referencia resueltos en una hoja de cálculo independiente.
          </div>
          <h2 className="sub">Cómo se decide el nivel</h2>
          <ul>
            {REGLA_NIVEL.map((r) => (
              <li key={r.nivel}>
                <strong>{r.nivel}:</strong> {r.condicion}
              </li>
            ))}
          </ul>
          <h2 className="sub">Reglas que valen para varios criterios</h2>
          <ul>
            {REGLAS_GENERALES.map((r) => (
              <li key={r.id}>
                <strong>{r.regla}.</strong> {r.detalle} <span className="meta">{r.aprobado ? "Aprobada" : "Pendiente de aprobación"}</span>
              </li>
            ))}
          </ul>
          {(["personas", "empresas"] as const).map((ambito) => (
            <div key={ambito}>
              <h2 className="sub">{ambito === "personas" ? "Personas" : "Empresas"}</h2>
              <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
                <table>
                  <thead>
                    <tr>
                      <th>Regla</th>
                      <th className="num">Umbral</th>
                      <th>Origen</th>
                      <th>Si se cambia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGLAS_METODOLOGIA.filter((r) => r.ambito === ambito).map((r) => (
                      <tr key={r.parametro}>
                        <td>
                          {r.regla}
                          {!r.afectaNivel ? <> <span className="etiqueta">Solo informa</span></> : null}
                        </td>
                        <td className="num">{r.umbral}</td>
                        <td>
                          <span className={`origen ${r.origen === "supuesto" ? "supuesto" : ""}`}>{ETIQUETA_ORIGEN[r.origen]}</span>
                          {r.fuente ? <><br />{r.fuente}</> : null}
                          <br />
                          <span className="meta">{r.aprobado ? "Aprobado" : "Pendiente de aprobación"}</span>
                        </td>
                        <td>{r.alternativa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="plegable">
        <summary>Normativa relevante</summary>
        <div className="contenido">
      <ul>
        {datos.normativa.registros.map((n) => (
          <li key={n.id}>
            <strong>{n.nombre}.</strong> {n.que_regula} <em>Para este sitio:</em> {n.implicacion_para_el_sitio}
            <br />
            <FuenteTraza traza={n.traza} />
          </li>
        ))}
      </ul>
        </div>
      </details>

      <details className="plegable">
        <summary>Fuentes de datos</summary>
        <div className="contenido">
      <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
        <table>
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Entidad</th>
              <th>Uso automatizado</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {datos.fuentes.registros.map((f) => (
              <tr key={f.id}>
                <td>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.nombre_oficial}
                    </a>
                  ) : (
                    f.nombre_oficial
                  )}
                  {!f.url_verificada ? (
                    <>
                      {" "}
                      <span className="etiqueta warn">URL sin verificar</span>
                    </>
                  ) : null}
                </td>
                <td>{f.entidad}</td>
                <td>{f.uso_automatizado === "no" ? "No" : f.uso_automatizado === "si" ? "Sí" : "Sin confirmar"}</td>
                <td>{f.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </details>

      <details className="plegable" id="vacios">
        <summary>Límites de los datos</summary>
        <div className="contenido">
      <p>Esto es lo que todavía no sabemos o no hemos podido confirmar. No lo rellenamos con suposiciones.</p>
      <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
        <table>
          <thead>
            <tr>
              <th>Dato pendiente</th>
              <th>Impacto</th>
              <th>Qué haremos</th>
            </tr>
          </thead>
          <tbody>
            {datos.vacios.registros.map((v) => (
              <tr key={v.id}>
                <td>{v.dato}</td>
                <td>{v.impacto}</td>
                <td>{v.accion_sugerida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </details>

      <details className="plegable">
        <summary>Glosario</summary>
        <div className="contenido">
      <dl>
        {datos.textos.glosario.map((g) => (
          <div key={g.termino} style={{ marginBottom: "0.75rem" }}>
            <dt>
              <strong>{g.termino}</strong>
            </dt>
            <dd style={{ margin: 0 }}>{g.definicion}</dd>
          </div>
        ))}
      </dl>
        </div>
      </details>
    </>
  );
}
