import { estadoMaximo, estadoMinimo, enElLimite } from "./umbrales";
import { ciiuSuperior } from "./benchmarks";
import { PARAMETROS_EMPRESA, type ParametrosEmpresa } from "./parametros";
import type { Benchmark } from "./schemas";
import { nivelDesdeFactores, type Dimension, type ErrorCampo, type Factor, type NivelResultado } from "./tipos";

export type Confirmacion = "si" | "no" | "no_se";

export interface EntradaEmpresa {
  ventasAnuales: number;
  activoCorriente: number;
  pasivoCorriente: number;
  /** null si no se conoce: la prueba ácida no se calcula. */
  inventarios: number | null;
  activoTotal: number;
  pasivoTotal: number;
  patrimonio: number;
  utilidadNeta: number;
  utilidadOperativa: number | null;
  gastosFinancieros: number | null;
  /** null si no se conoce: los días de cobranza no se calculan. */
  cuentasPorCobrar: number | null;
  /** Flujo disponible para servicio de deuda (null: el DSCR queda "No calculable"). */
  flujoDisponible: number | null;
  /** Servicio total de la deuda: capital más intereses del período (null: el DSCR queda "No calculable"). */
  servicioDeuda: number | null;
  aniosRuc: number;
  cumplimientoTributario: Confirmacion;
  obligacionesPatronales: Confirmacion;
  estadosFinancierosPresentados: Confirmacion;
  /** Cierre del año anterior (opcional): habilita crecimiento, variación del margen y promedios de saldos. */
  anterior?: CierreAnterior | null;
}

export interface CierreAnterior {
  ventasAnuales: number;
  utilidadNeta: number;
  activoTotal: number;
  patrimonio: number;
}

export type RatioId =
  | "razon_corriente"
  | "prueba_acida"
  | "endeudamiento"
  | "apalancamiento"
  | "margen_neto"
  | "roa"
  | "roe"
  | "cobertura_intereses"
  | "rotacion_activos"
  | "dias_cobranza"
  | "dscr"
  | "crecimiento_ventas"
  | "variacion_margen"
  | "roa_promedio"
  | "roe_promedio";

export type Ratios = Record<RatioId, number | null>;

const esNumero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** División segura: null si el denominador no es positivo. */
const dividir = (a: number, b: number): number | null => (b > 0 ? a / b : null);
const porcentaje = (v: number | null): number | null => (v === null ? null : v * 100);

/**
 * Los ratios que usan saldos (ROA, ROE, rotación) se calculan con el saldo de cierre,
 * no con promedios: esa simplificación se declara en la metodología.
 */
export function calcularRatios(e: EntradaEmpresa): Ratios {
  const cobroSobreVentas = e.cuentasPorCobrar === null ? null : dividir(e.cuentasPorCobrar, e.ventasAnuales);
  return {
    razon_corriente: dividir(e.activoCorriente, e.pasivoCorriente),
    prueba_acida: e.inventarios === null ? null : dividir(e.activoCorriente - e.inventarios, e.pasivoCorriente),
    endeudamiento: porcentaje(dividir(e.pasivoTotal, e.activoTotal)),
    apalancamiento: dividir(e.pasivoTotal, e.patrimonio),
    margen_neto: porcentaje(dividir(e.utilidadNeta, e.ventasAnuales)),
    roa: porcentaje(dividir(e.utilidadNeta, e.activoTotal)),
    roe: porcentaje(dividir(e.utilidadNeta, e.patrimonio)),
    cobertura_intereses:
      e.utilidadOperativa === null || e.gastosFinancieros === null
        ? null
        : dividir(e.utilidadOperativa, e.gastosFinancieros),
    rotacion_activos: dividir(e.ventasAnuales, e.activoTotal),
    dias_cobranza: cobroSobreVentas === null ? null : cobroSobreVentas * 365,
    dscr: e.flujoDisponible === null || e.servicioDeuda === null ? null : dividir(e.flujoDisponible, e.servicioDeuda),
    ...ratiosConAnterior(e),
  };
}

/** Indicadores que necesitan dos cierres. Sin el año anterior quedan en null (no calculables). */
function ratiosConAnterior(e: EntradaEmpresa): Pick<Ratios, "crecimiento_ventas" | "variacion_margen" | "roa_promedio" | "roe_promedio"> {
  const a = e.anterior;
  if (!a) return { crecimiento_ventas: null, variacion_margen: null, roa_promedio: null, roe_promedio: null };
  const margenActual = porcentaje(dividir(e.utilidadNeta, e.ventasAnuales));
  const margenAnterior = porcentaje(dividir(a.utilidadNeta, a.ventasAnuales));
  return {
    crecimiento_ventas: a.ventasAnuales > 0 ? (e.ventasAnuales / a.ventasAnuales - 1) * 100 : null,
    variacion_margen: margenActual === null || margenAnterior === null ? null : margenActual - margenAnterior,
    roa_promedio: porcentaje(dividir(e.utilidadNeta, (e.activoTotal + a.activoTotal) / 2)),
    roe_promedio: porcentaje(dividir(e.utilidadNeta, (e.patrimonio + a.patrimonio) / 2)),
  };
}

export function validarEmpresa(
  e: Partial<Record<keyof EntradaEmpresa, unknown>>,
  params: ParametrosEmpresa = PARAMETROS_EMPRESA,
): ErrorCampo[] {
  const errores: ErrorCampo[] = [];

  const numero = (campo: keyof EntradaEmpresa, opciones: { positivo?: boolean; noNegativo?: boolean; opcional?: boolean }) => {
    const v = e[campo];
    if (v === undefined || v === null || v === "") {
      if (!opciones.opcional) errores.push({ campo, codigo: "campo_requerido" });
      return;
    }
    if (!esNumero(v) || (opciones.positivo && v <= 0) || (opciones.noNegativo && v < 0)) {
      errores.push({ campo, codigo: "numero_invalido" });
    }
  };

  numero("ventasAnuales", { positivo: true });
  numero("activoCorriente", { noNegativo: true });
  numero("pasivoCorriente", { noNegativo: true });
  numero("inventarios", { noNegativo: true, opcional: true });
  numero("activoTotal", { positivo: true });
  numero("pasivoTotal", { noNegativo: true });
  numero("patrimonio", {}); // puede ser negativo
  numero("utilidadNeta", {}); // puede ser negativa
  numero("utilidadOperativa", { opcional: true });
  numero("gastosFinancieros", { noNegativo: true, opcional: true });
  numero("cuentasPorCobrar", { noNegativo: true, opcional: true });
  numero("flujoDisponible", { opcional: true });
  numero("servicioDeuda", { noNegativo: true, opcional: true });
  numero("aniosRuc", { noNegativo: true });

  for (const campo of ["cumplimientoTributario", "obligacionesPatronales", "estadosFinancierosPresentados"] as const) {
    const v = e[campo];
    if (v !== "si" && v !== "no" && v !== "no_se") errores.push({ campo, codigo: "campo_requerido" });
  }

  // Año anterior (opcional): si viene, sus datos deben ser válidos.
  const ant = e.anterior as Partial<Record<keyof CierreAnterior, unknown>> | null | undefined;
  if (ant) {
    const bien =
      esNumero(ant.ventasAnuales) && ant.ventasAnuales > 0 && esNumero(ant.activoTotal) && ant.activoTotal > 0 &&
      esNumero(ant.utilidadNeta) && esNumero(ant.patrimonio);
    if (!bien) errores.push({ campo: "anterior", codigo: "numero_invalido" });
  }

  // El balance debe cuadrar (activo ≈ pasivo + patrimonio) dentro de una tolerancia.
  const { activoTotal, pasivoTotal, patrimonio } = e;
  if (esNumero(activoTotal) && esNumero(pasivoTotal) && esNumero(patrimonio) && activoTotal > 0) {
    const diferencia = Math.abs(activoTotal - (pasivoTotal + patrimonio)) / activoTotal;
    if (diferencia > params.toleranciaBalance) {
      errores.push({ campo: "activoTotal", codigo: "balance_no_cuadra" });
    }
  }
  return errores;
}

export interface ResultadoEmpresa {
  nivel: NivelResultado;
  factores: Factor[];
  ratios: Ratios | null;
  errores: ErrorCampo[];
}

const fmt = (v: number, d = 2) =>
  new Intl.NumberFormat("es-EC", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

export function estimarEmpresa(
  entrada: EntradaEmpresa,
  params: ParametrosEmpresa = PARAMETROS_EMPRESA,
): ResultadoEmpresa {
  const errores = validarEmpresa(entrada, params);
  if (errores.length > 0) return { nivel: "insuficiente", factores: [], ratios: null, errores };

  const ratios = calcularRatios(entrada);
  const factores: Factor[] = [];

  // Liquidez
  const rc = ratios.razon_corriente;
  const reglaRc = params.reglasRatios["razon_corriente"];
  if (rc === null || !reglaRc) {
    factores.push({
      id: "razon_corriente",
      dimension: "liquidez",
      etiqueta: "Liquidez (razón corriente)",
      estado: "no_cumple",
      detalle: "No hay pasivo corriente positivo: la razón corriente no se puede interpretar con estos datos.",
      recomendacion: "Revisa que el pasivo corriente esté bien ingresado.",
    });
  } else {
    const estado = estadoMinimo(rc, reglaRc.valor);
    const ok = estado === "cumple";
    factores.push({
      id: "razon_corriente",
      dimension: "liquidez",
      etiqueta: "Liquidez (razón corriente)",
      estado,
      detalle: `Razón corriente de ${fmt(rc)}. Convención general: más de ${reglaRc.valor}${enElLimite(rc, reglaRc.valor) ? "; estás justo en el límite, que queda en atención" : ""}.`,
      recomendacion: ok ? null : "Mejora la liquidez: reduce deuda de corto plazo, acelera cobros o reestructura pasivos.",
    });
  }

  // Solvencia
  const end = ratios.endeudamiento;
  const reglaEnd = params.reglasRatios["endeudamiento"];
  if (end !== null && reglaEnd) {
    const estado = estadoMaximo(end, reglaEnd.valor);
    const ok = estado === "cumple";
    factores.push({
      id: "endeudamiento",
      dimension: "solvencia",
      etiqueta: "Endeudamiento del activo",
      estado,
      detalle: `El ${fmt(end, 1)} % de tus activos está financiado con pasivos. Parámetro referencial propio (no oficial): menos de ${reglaEnd.valor} %${enElLimite(end, reglaEnd.valor) ? "; estás justo en el límite, que queda en atención" : ""}.`,
      recomendacion: ok ? null : "Reduce pasivos o capitaliza utilidades antes de pedir más financiamiento.",
    });
  }

  const patrimonioPositivo = entrada.patrimonio > 0;
  factores.push({
    id: "patrimonio",
    dimension: "solvencia",
    etiqueta: "Patrimonio",
    estado: patrimonioPositivo ? "cumple" : "no_cumple",
    detalle: patrimonioPositivo ? "El patrimonio es positivo." : "El patrimonio es cero o negativo.",
    recomendacion: patrimonioPositivo ? null : "Un patrimonio negativo dificulta cualquier aprobación; evalúa un aporte de capital.",
  });

  // Rentabilidad y cobertura
  const mn = ratios.margen_neto;
  const reglaMn = params.reglasRatios["margen_neto"];
  if (mn !== null && reglaMn) {
    const estado = estadoMinimo(mn, reglaMn.valor);
    const ok = estado === "cumple";
    factores.push({
      id: "margen_neto",
      dimension: "rentabilidad",
      etiqueta: "Rentabilidad (margen neto)",
      estado,
      detalle: `Margen neto de ${fmt(mn, 1)} %${enElLimite(mn, reglaMn.valor) ? ": ni ganancia ni pérdida, justo en el límite, que queda en atención" : ""}.`,
      recomendacion: ok ? null : estado === "atencion" ? "Sin utilidad no hay margen para pagar deuda: revisa costos y precios." : "Una utilidad negativa indica pérdidas: revisa costos y precios.",
    });
  }

  const ci = ratios.cobertura_intereses;
  const reglaCi = params.reglasRatios["cobertura_intereses"];
  if (ci !== null && reglaCi) {
    const estado = estadoMinimo(ci, reglaCi.valor);
    const ok = estado === "cumple";
    factores.push({
      id: "cobertura_intereses",
      dimension: "rentabilidad",
      etiqueta: "Cobertura de intereses",
      estado,
      detalle: `La utilidad operativa cubre ${fmt(ci)} veces los gastos financieros${enElLimite(ci, reglaCi.valor) ? ": justo en el límite, que queda en atención" : ""}.`,
      recomendacion: ok ? null : estado === "atencion" ? "La utilidad operativa apenas cubre los intereses: no hay margen." : "La utilidad operativa no alcanza a cubrir los intereses.",
    });
  }

  // Cobertura del servicio de la deuda (DSCR): solo si la empresa declaró flujo y servicio de deuda.
  const dscr = ratios.dscr;
  if (dscr !== null) {
    const min = params.dscrMinimoReferencial;
    const estado = dscr >= 1 ? estadoMinimo(dscr, min, "atencion") : "no_cumple";
    factores.push({
      id: "dscr",
      dimension: "rentabilidad",
      etiqueta: "Cobertura del servicio de la deuda (DSCR)",
      estado,
      detalle: `El flujo disponible cubre ${fmt(dscr)} veces el servicio de la deuda. Referencia propia (no oficial): más de ${fmt(min)}; entre 1,00 y ${fmt(min)} queda en atención${enElLimite(dscr, min) ? "; estás justo en el límite" : ""}.`,
      recomendacion:
        estado === "cumple"
          ? null
          : dscr < 1
            ? "El flujo no alcanza a pagar la deuda: reduce el monto, amplía el plazo o mejora el flujo antes de solicitar."
            : "El flujo cubre la deuda con poco margen: una caída de ventas podría dejarte sin cobertura.",
    });
  }

  // Cumplimiento y documentos
  const anios = entrada.aniosRuc;
  const estadoRuc = anios >= params.aniosRucMinimo ? estadoMinimo(anios, params.aniosRucSolido, "atencion") : "no_cumple";
  factores.push({
    id: "antiguedad_ruc",
    dimension: "cumplimiento",
    etiqueta: "Antigüedad del RUC",
    estado: estadoRuc,
    detalle: `Tu RUC tiene ${anios} año(s). Ejemplo de entidad: Banco Pichincha pide 3 años para crédito productivo; otras piden menos.${enElLimite(anios, params.aniosRucSolido) ? " Estás justo en el límite sólido, que queda en atención." : ""}`,
    recomendacion:
      estadoRuc === "cumple"
        ? null
        : "Con poca antigüedad, considera productos para negocios nuevos o garantías de la CFN.",
  });

  const confirmacion = (
    id: string,
    dimension: Dimension,
    etiqueta: string,
    valor: Confirmacion,
    detalleSi: string,
    detalleNo: string,
    recomendacion: string,
  ): Factor => ({
    id,
    dimension,
    etiqueta,
    estado: valor === "si" ? "cumple" : valor === "no" ? "no_cumple" : "atencion",
    detalle: valor === "si" ? detalleSi : valor === "no" ? detalleNo : "No lo sabes: verifícalo antes de solicitar.",
    recomendacion: valor === "si" ? null : recomendacion,
  });
  factores.push(
    confirmacion(
      "tributario",
      "cumplimiento",
      "Cumplimiento tributario",
      entrada.cumplimientoTributario,
      "Indicas que estás al día con el SRI.",
      "Indicas que tienes deudas o incumplimientos con el SRI.",
      "Regulariza con el SRI y obtén el certificado de cumplimiento tributario.",
    ),
    confirmacion(
      "patronales",
      "cumplimiento",
      "Obligaciones patronales (IESS)",
      entrada.obligacionesPatronales,
      "Indicas que estás al día con el IESS.",
      "Indicas que registras mora patronal con el IESS.",
      "Regulariza con el IESS y obtén el certificado de obligaciones patronales.",
    ),
    confirmacion(
      "estados_financieros",
      "cumplimiento",
      "Estados financieros presentados",
      entrada.estadosFinancierosPresentados,
      "Indicas que presentaste estados financieros a la Superintendencia de Compañías.",
      "Indicas que no presentaste estados financieros.",
      "Presenta tus estados financieros: son un requisito frecuente.",
    ),
  );

  return { nivel: nivelDesdeFactores(factores), factores, ratios, errores: [] };
}

// ---------- comparación con el sector ----------
export type BandaSector = "bajo_p25" | "p25_mediana" | "mediana_p75" | "sobre_p75";

export interface ComparacionRatio {
  ratio: RatioId;
  valor: number;
  p10: number;
  p25: number;
  mediana: number;
  p75: number;
  p90: number;
  nEmpresas: number;
  banda: BandaSector;
}

export type ComparacionSector =
  | { disponible: false; motivo: string }
  | { disponible: true; periodo: string; comparaciones: ComparacionRatio[] };

function bandaDe(valor: number, b: Pick<Benchmark, "p25" | "mediana" | "p75">): BandaSector {
  if (valor < b.p25) return "bajo_p25";
  if (valor < b.mediana) return "p25_mediana";
  if (valor < b.p75) return "mediana_p75";
  return "sobre_p75";
}

/**
 * Compara los ratios de la empresa con los benchmarks de su sector (CIIU) y tamaño.
 * Mientras no existan benchmarks calculados con datos oficiales, devuelve "no disponible".
 * En endeudamiento o días de cobranza, estar "sobre el p75" no es necesariamente mejor.
 */
export function compararConSector(
  ratios: Ratios,
  benchmarks: Benchmark[],
  filtro: { ciiu: string; tamano: Benchmark["tamano"] },
): ComparacionSector {
  // Busca la celda del CIIU exacto y, si no existe, sube de nivel (C1071.01 → C10710 → C1071 → ...).
  let delSector: Benchmark[] = [];
  let ciiu: string | null = filtro.ciiu.trim().toUpperCase().replace(".", "");
  while (ciiu !== null && delSector.length === 0) {
    const actual: string = ciiu;
    delSector = benchmarks.filter((b) => b.ciiu === actual && b.tamano === filtro.tamano);
    ciiu = ciiuSuperior(actual);
  }
  if (delSector.length === 0) {
    return { disponible: false, motivo: "Aún no hay datos sectoriales verificados para este sector y tamaño." };
  }
  const periodo = delSector.map((b) => b.periodo).sort().at(-1) as string;
  const vigentes = delSector.filter((b) => b.periodo === periodo);
  const comparaciones: ComparacionRatio[] = [];
  for (const b of vigentes) {
    const valor = ratios[b.ratio_id as RatioId];
    if (valor === null || valor === undefined) continue;
    comparaciones.push({
      ratio: b.ratio_id as RatioId,
      valor,
      p10: b.p10,
      p25: b.p25,
      mediana: b.mediana,
      p75: b.p75,
      p90: b.p90,
      nEmpresas: b.n_empresas,
      banda: bandaDe(valor, b),
    });
  }
  return { disponible: true, periodo, comparaciones };
}
