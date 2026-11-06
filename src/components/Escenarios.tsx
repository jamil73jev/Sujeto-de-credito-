import { formatoMoneda, formatoPct } from "@/lib/numeros";
import type { ResultadoEscenarioEmpresa, ResultadoEscenarioPersona, SensibilidadEmpresa, SensibilidadPersona } from "@/lib/escenarios";
import type { EstadoFactor } from "@/lib/tipos";

const ESTADO: Record<EstadoFactor, { texto: string; clase: string }> = {
  cumple: { texto: "Cumple", clase: "ok" },
  atencion: { texto: "Atención", clase: "warn" },
  no_cumple: { texto: "No cumple", clase: "bad" },
  sin_dato: { texto: "Sin dato", clase: "" },
};

const decimal = (v: number) => new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const entero = (v: number) => new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }).format(v);

function Tarjetas({ filas }: { filas: Array<{ id: string; nombre: string; supuesto: string; lineas: string[]; estado: EstadoFactor }> }) {
  return (
    <div className="escenarios">
      {filas.map((f) => (
        <div className="escenario" key={f.id}>
          <div className="cab">
            <strong>{f.nombre}</strong>
            <span className={`etiqueta ${ESTADO[f.estado].clase}`}>{ESTADO[f.estado].texto}</span>
          </div>
          <span className="supuesto">{f.supuesto}</span>
          {f.lineas.map((l) => (
            <span className="linea" key={l}>
              {l}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EscenariosPersona({ escenarios, sensibilidad }: { escenarios: ResultadoEscenarioPersona[]; sensibilidad: SensibilidadPersona }) {
  return (
    <details className="dimension">
      <summary>
        <span>Escenarios y sensibilidad</span>
      </summary>
      <p className="meta">Hipótesis ilustrativas de la metodología, no predicciones.</p>
      <Tarjetas
        filas={escenarios.map((e) => ({
          id: e.escenario.id,
          nombre: e.escenario.nombre,
          supuesto: e.escenario.id === "base" ? "Sin cambios" : `Ingreso −${e.escenario.reduccionIngresoPct} %, cuotas +${e.escenario.aumentoCuotasPct} %`,
          lineas: [
            e.ratioPct === null ? "Sin ingreso" : `Cuotas: ${formatoPct(e.ratioPct, 1)} del ingreso`,
            ...(e.disponible === null ? [] : [`Te quedan ${formatoMoneda(e.disponible)}`]),
          ],
          estado: e.estado,
        }))}
      />
      <ul className="sensibilidad">
        <li>
          Cuota nueva que te llevaría justo al máximo (con esa cifra exacta quedas en atención): <strong>{formatoMoneda(sensibilidad.cuotaNuevaMaxima)}</strong> al mes.
        </li>
        <li>
          Ingreso con el que tus cuotas actuales y la nueva quedarían justo en el máximo: <strong>{formatoMoneda(sensibilidad.ingresoMinimo)}</strong> al mes.
        </li>
        <li>
          Caída de ingreso que puedes absorber antes de llegar al máximo: <strong>{formatoPct(sensibilidad.caidaIngresoMaximaPct, 0)}</strong>.
        </li>
      </ul>
    </details>
  );
}

export function EscenariosEmpresa({ escenarios, sensibilidad, minimo }: { escenarios: ResultadoEscenarioEmpresa[]; sensibilidad: SensibilidadEmpresa; minimo: number }) {
  return (
    <details className="dimension">
      <summary>
        <span>Escenarios y sensibilidad</span>
      </summary>
      <p className="meta">
        Hipótesis ilustrativas sobre el flujo y el servicio de la deuda. La referencia de {decimal(minimo)} es un supuesto propuesto, aún sin aprobar, y no cambia el nivel.
      </p>
      <Tarjetas
        filas={escenarios.map((e) => ({
          id: e.escenario.id,
          nombre: e.escenario.nombre,
          supuesto: e.escenario.id === "base" ? "Sin cambios" : `Flujo −${e.escenario.reduccionIngresoPct} %, servicio de deuda +${e.escenario.aumentoCuotasPct} %`,
          lineas: [e.dscr === null ? "No calculable" : `Cobertura de la deuda: ${decimal(e.dscr)}`],
          estado: e.estado,
        }))}
      />
      <ul className="sensibilidad">
        <li>
          El flujo puede caer <strong>{entero(sensibilidad.caidaFlujoHasta1Pct)} %</strong> antes de que la cobertura baje de 1,00.
        </li>
        <li>
          Puede caer <strong>{entero(sensibilidad.caidaFlujoHastaMinimoPct)} %</strong> antes de bajar de la referencia ({decimal(minimo)}).
        </li>
      </ul>
    </details>
  );
}
