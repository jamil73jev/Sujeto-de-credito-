import { ESCENARIOS, PARAMETROS_EMPRESA, PARAMETROS_PERSONA, type Escenario, type ParametrosEmpresa, type ParametrosPersona } from "./parametros";
import type { EstadoFactor } from "./tipos";
import { estadoMaximo, estadoMinimo, peorEstado } from "./umbrales";

export interface ResultadoEscenarioPersona {
  escenario: Escenario;
  ratioPct: number | null;
  disponible: number | null;
  estado: EstadoFactor;
}

export interface SensibilidadPersona {
  /** Cuota nueva más alta que mantiene las cuotas totales dentro del máximo (nunca negativa). */
  cuotaNuevaMaxima: number;
  /** Ingreso mensual mínimo con el que las cuotas actuales y la nueva respetan el máximo. */
  ingresoMinimo: number;
  /** Caída de ingreso (en %) que se puede absorber antes de superar el máximo; 0 si ya lo supera. */
  caidaIngresoMaximaPct: number;
}

export interface EntradaEscenariosPersona {
  ingresoMensual: number;
  gastosEsenciales: number | null;
  cuotasMensualesActuales: number;
  cuotaNuevaEstimada: number;
}

/** Estado de capacidad de pago bajo un escenario: mismas reglas que los criterios de cuotas e ingreso disponible. */
export function escenariosPersona(
  e: EntradaEscenariosPersona,
  params: ParametrosPersona = PARAMETROS_PERSONA,
  escenarios: Escenario[] = ESCENARIOS,
): { escenarios: ResultadoEscenarioPersona[]; sensibilidad: SensibilidadPersona } {
  const cuotas = e.cuotasMensualesActuales + e.cuotaNuevaEstimada;
  const max = params.maxCuotasSobreIngresoPct;
  const resultados = escenarios.map((escenario): ResultadoEscenarioPersona => {
    const ingreso = e.ingresoMensual * (1 - escenario.reduccionIngresoPct / 100);
    const cuotasEsc = cuotas * (1 + escenario.aumentoCuotasPct / 100);
    const ratioPct = ingreso > 0 ? (cuotasEsc / ingreso) * 100 : null;
    const disponible = e.gastosEsenciales === null ? null : ingreso - e.gastosEsenciales - cuotasEsc;
    let estado: EstadoFactor = ratioPct === null ? "no_cumple" : estadoMaximo(ratioPct, max, params.margenAtencionPct);
    if (disponible !== null) estado = peorEstado(estado, estadoMinimo(disponible, 0));
    return { escenario, ratioPct, disponible, estado };
  });
  const tope = (max / 100) * e.ingresoMensual;
  return {
    escenarios: resultados,
    sensibilidad: {
      cuotaNuevaMaxima: Math.max(0, tope - e.cuotasMensualesActuales),
      ingresoMinimo: cuotas / (max / 100),
      caidaIngresoMaximaPct: tope > 0 && cuotas <= tope ? (1 - cuotas / tope) * 100 : 0,
    },
  };
}

export interface ResultadoEscenarioEmpresa {
  escenario: Escenario;
  dscr: number | null;
  estado: EstadoFactor;
}

export interface SensibilidadEmpresa {
  /** Caída del flujo (en %) con la que el DSCR llega a 1,0; 0 si ya es menor. */
  caidaFlujoHasta1Pct: number;
  /** Caída del flujo (en %) con la que el DSCR baja del mínimo referencial; 0 si ya está por debajo. */
  caidaFlujoHastaMinimoPct: number;
}

export function escenariosEmpresa(
  e: { flujoDisponible: number | null; servicioDeuda: number | null },
  params: ParametrosEmpresa = PARAMETROS_EMPRESA,
  escenarios: Escenario[] = ESCENARIOS,
): { escenarios: ResultadoEscenarioEmpresa[]; sensibilidad: SensibilidadEmpresa } | null {
  if (e.flujoDisponible === null || e.servicioDeuda === null || e.servicioDeuda <= 0) return null;
  const { flujoDisponible: flujo, servicioDeuda: servicio } = e;
  const resultados = escenarios.map((escenario): ResultadoEscenarioEmpresa => {
    const dscr = (flujo * (1 - escenario.reduccionIngresoPct / 100)) / (servicio * (1 + escenario.aumentoCuotasPct / 100));
    const estado: EstadoFactor = dscr >= 1 ? estadoMinimo(dscr, params.dscrMinimoReferencial, "atencion") : "no_cumple";
    return { escenario, dscr, estado };
  });
  const caida = (objetivo: number) => (flujo > 0 ? Math.max(0, (1 - (objetivo * servicio) / flujo) * 100) : 0);
  return {
    escenarios: resultados,
    sensibilidad: { caidaFlujoHasta1Pct: caida(1), caidaFlujoHastaMinimoPct: caida(params.dscrMinimoReferencial) },
  };
}
