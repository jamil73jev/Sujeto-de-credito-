import { PARAMETROS_PERSONA, type ParametrosPersona } from "./parametros";

/** Número con formato es-EC (coma decimal) para los textos que ve la persona. */
const num = (v: number, decimales: number) =>
  new Intl.NumberFormat("es-EC", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(v);
import { estadoMaximo, estadoMinimo, enElLimite } from "./umbrales";
import { nivelDesdeFactores, type ErrorCampo, type Factor, type NivelResultado } from "./tipos";

export interface EntradaPersona {
  edad: number;
  tipoIngreso: "dependencia" | "independiente";
  /** Meses de ingreso estable (en el empleo actual o con ingresos comprobables si es independiente). */
  mesesIngresoEstable: number;
  ingresoMensual: number;
  /** Suma de cuotas mensuales de deudas actuales, incluidas las informales (0 si no tiene). */
  cuotasMensualesActuales: number;
  /** Cuota mensual del crédito que quiere solicitar (0 si aún no lo sabe). */
  cuotaNuevaEstimada: number;
  /** Score que ya conoce (1 a 999) o null si no lo conoce. */
  scoreConocido: number | null;
  moraActual: "no" | "si" | "no_se";
  /** Gastos mensuales esenciales (vivienda, alimentación, servicios, transporte). Opcional. */
  gastosEsenciales?: number | null;
  /** Escenario de la prueba de estrés. Si falta, se usa el de los parámetros. */
  estres?: { reduccionIngresoPct: number; aumentoCuotasPct: number } | null;
  /** Documentos que declara poder respaldar, sobre el total pedido. Opcional. */
  documentos?: { listos: number; total: number } | null;
}

export interface ResultadoPersona {
  nivel: NivelResultado;
  factores: Factor[];
  /** Cuotas totales sobre ingreso mensual, en %. */
  ratioCuotasPct: number | null;
  /** Ingreso menos gastos esenciales y cuotas totales; null si no declaró gastos. */
  ingresoDisponible: number | null;
  /** Cuotas sobre ingreso en el escenario de estrés, en %; null si el ingreso del escenario no es positivo. */
  ratioEstresPct: number | null;
  errores: ErrorCampo[];
}

const esNumero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const vacio = (v: unknown) => v === undefined || v === null || v === "";

export function validarPersona(e: Partial<Record<keyof EntradaPersona, unknown>>): ErrorCampo[] {
  const errores: ErrorCampo[] = [];
  const requerirNumero = (campo: keyof EntradaPersona, min: number, max = Number.POSITIVE_INFINITY, exclusivo = false) => {
    const v = e[campo];
    if (vacio(v)) {
      errores.push({ campo, codigo: "campo_requerido" });
    } else if (!esNumero(v) || (exclusivo ? v <= min : v < min) || v > max) {
      errores.push({ campo, codigo: "numero_invalido" });
    }
  };
  requerirNumero("edad", 0, 120);
  requerirNumero("mesesIngresoEstable", 0, 1200);
  requerirNumero("ingresoMensual", 0, Number.POSITIVE_INFINITY, true);
  requerirNumero("cuotasMensualesActuales", 0);
  requerirNumero("cuotaNuevaEstimada", 0);
  if (e.tipoIngreso !== "dependencia" && e.tipoIngreso !== "independiente") {
    errores.push({ campo: "tipoIngreso", codigo: "campo_requerido" });
  }
  if (e.moraActual !== "no" && e.moraActual !== "si" && e.moraActual !== "no_se") {
    errores.push({ campo: "moraActual", codigo: "campo_requerido" });
  }
  const s = e.scoreConocido;
  if (!vacio(s) && (!esNumero(s) || !Number.isInteger(s) || s < 1 || s > 999)) {
    errores.push({ campo: "scoreConocido", codigo: "numero_invalido" });
  }
  // Opcionales: si vienen, deben ser válidos.
  const g = e.gastosEsenciales;
  if (!vacio(g) && (!esNumero(g) || g < 0)) errores.push({ campo: "gastosEsenciales", codigo: "numero_invalido" });

  const est = e.estres as { reduccionIngresoPct?: unknown; aumentoCuotasPct?: unknown } | null | undefined;
  if (est) {
    if (!esNumero(est.reduccionIngresoPct) || est.reduccionIngresoPct < 0 || est.reduccionIngresoPct > 100) {
      errores.push({ campo: "estresReduccionIngreso", codigo: "numero_invalido" });
    }
    if (!esNumero(est.aumentoCuotasPct) || est.aumentoCuotasPct < 0) {
      errores.push({ campo: "estresAumentoCuotas", codigo: "numero_invalido" });
    }
  }

  const docs = e.documentos as { listos?: unknown; total?: unknown } | null | undefined;
  if (docs) {
    const ok =
      esNumero(docs.listos) && esNumero(docs.total) && Number.isInteger(docs.listos) && Number.isInteger(docs.total) &&
      docs.total >= 0 && docs.listos >= 0 && docs.listos <= docs.total;
    if (!ok) errores.push({ campo: "documentos", codigo: "numero_invalido" });
  }
  return errores;
}

export function estimarPersona(
  entrada: EntradaPersona,
  params: ParametrosPersona = PARAMETROS_PERSONA,
): ResultadoPersona {
  const errores = validarPersona(entrada);
  if (errores.length > 0) {
    return { nivel: "insuficiente", factores: [], ratioCuotasPct: null, ingresoDisponible: null, ratioEstresPct: null, errores };
  }

  const factores: Factor[] = [];

  // --- Requisitos básicos ---
  const mayor = entrada.edad >= params.edadMinima;
  factores.push({
    id: "edad",
    dimension: "elegibilidad",
    etiqueta: "Mayoría de edad",
    estado: mayor ? "cumple" : "no_cumple",
    detalle: mayor ? `Tienes ${entrada.edad} años.` : `Las entidades piden al menos ${params.edadMinima} años.`,
    recomendacion: mayor ? null : "Una persona menor de edad generalmente no puede contratar crédito por sí misma.",
  });

  // --- Capacidad de pago ---
  const minMeses =
    entrada.tipoIngreso === "dependencia" ? params.mesesMinimosDependencia : params.mesesMinimosIndependiente;
  const estadoMeses = entrada.mesesIngresoEstable > 0 ? estadoMinimo(entrada.mesesIngresoEstable, minMeses, "atencion") : "no_cumple";
  const cumpleMeses = estadoMeses === "cumple";
  factores.push({
    id: "estabilidad",
    dimension: "capacidad_pago",
    etiqueta: "Estabilidad de ingresos",
    estado: estadoMeses,
    detalle: cumpleMeses
      ? `Tienes ${entrada.mesesIngresoEstable} meses de ingreso estable (referencia: más de ${minMeses}).`
      : enElLimite(entrada.mesesIngresoEstable, minMeses)
        ? `Tienes ${entrada.mesesIngresoEstable} meses de ingreso estable: justo la referencia (${minMeses}). Estar en el límite queda en atención.`
        : `Tienes ${entrada.mesesIngresoEstable} meses de ingreso estable y la referencia es ${minMeses}.`,
    recomendacion: cumpleMeses
      ? null
      : "Reúne comprobantes de ingresos y espera a acumular más antigüedad antes de solicitar.",
  });

  const cuotasTotales = entrada.cuotasMensualesActuales + entrada.cuotaNuevaEstimada;
  const ratio = (cuotasTotales / entrada.ingresoMensual) * 100;
  const max = params.maxCuotasSobreIngresoPct;
  const estadoRatio = estadoMaximo(ratio, max, params.margenAtencionPct);
  factores.push({
    id: "endeudamiento",
    dimension: "capacidad_pago",
    etiqueta: "Cuotas sobre ingreso",
    estado: estadoRatio,
    detalle: `Tus cuotas (actuales y la nueva) serían ${num(ratio, 1)} % de tu ingreso. Referencia propia de este sitio (no oficial; no existe un límite general en Ecuador): menos de ${max} %${enElLimite(ratio, max) ? "; estás justo en el límite, que queda en atención" : ""}.`,
    recomendacion:
      estadoRatio === "cumple"
        ? null
        : "Reduce el monto solicitado, amplía el plazo o cancela deudas actuales antes de solicitar.",
  });

  const gastos = vacio(entrada.gastosEsenciales) ? null : (entrada.gastosEsenciales as number);
  const disponible = gastos === null ? null : entrada.ingresoMensual - gastos - cuotasTotales;
  if (disponible === null) {
    factores.push({
      id: "ingreso_disponible",
      dimension: "capacidad_pago",
      etiqueta: "Ingreso disponible",
      estado: "sin_dato",
      detalle: "No indicaste tus gastos esenciales, así que no se calculó cuánto te queda después de cuotas y gastos.",
      recomendacion: "Agrega tus gastos esenciales para ver tu capacidad de pago real.",
    });
  } else {
    factores.push({
      id: "ingreso_disponible",
      dimension: "capacidad_pago",
      etiqueta: "Ingreso disponible",
      estado: estadoMinimo(disponible, 0),
      detalle:
        disponible > 0
          ? `Después de gastos esenciales y cuotas te quedarían ${num(disponible, 2)} USD al mes.`
          : enElLimite(disponible, 0)
            ? "Después de gastos esenciales y cuotas no te quedaría nada al mes: no hay margen para imprevistos."
            : `Tus gastos esenciales y cuotas superarían tu ingreso en ${num(Math.abs(disponible), 2)} USD al mes.`,
      recomendacion: disponible > 0 ? null : "Con ese resultado una nueva cuota no es sostenible: reduce gastos o deudas primero.",
    });
  }

  // --- Historial según lo declarado ---
  factores.push({
    id: "mora",
    dimension: "historial",
    etiqueta: "Deudas en mora",
    estado: entrada.moraActual === "no" ? "cumple" : entrada.moraActual === "si" ? "no_cumple" : "atencion",
    detalle:
      entrada.moraActual === "no"
        ? "Indicas que no tienes deudas en mora."
        : entrada.moraActual === "si"
          ? "Indicas que tienes deudas en mora."
          : "No sabes si tienes deudas en mora.",
    recomendacion:
      entrada.moraActual === "no"
        ? null
        : entrada.moraActual === "si"
          ? "Regulariza las deudas vencidas y negocia con la entidad antes de solicitar un nuevo crédito."
          : "Consulta tu reporte de datos crediticios en la Superintendencia de Bancos para salir de dudas.",
  });

  const score = vacio(entrada.scoreConocido) ? null : (entrada.scoreConocido as number);
  if (score === null) {
    factores.push({
      id: "score",
      dimension: "historial",
      etiqueta: "Score crediticio",
      estado: "sin_dato",
      detalle: "No indicaste tu score.",
      recomendacion: "Puedes conocer tu score en tu reporte de buró de crédito (ver Verificaciones oficiales).",
    });
  } else {
    const estado =
      score >= params.scoreRechazoFrecuente ? estadoMinimo(score, params.scoreFavorable, "atencion") : "no_cumple";
    factores.push({
      id: "score",
      dimension: "historial",
      etiqueta: "Score crediticio",
      estado,
      detalle: `Tu score es ${score}. Referencias de prensa: por encima de ${params.scoreFavorable} suele ser un buen punto de partida; por debajo de ${params.scoreRechazoFrecuente} es frecuente el rechazo. Cada entidad aplica sus propios cortes.`,
      recomendacion:
        estado === "cumple"
          ? null
          : "Paga a tiempo, reduce saldos de tarjetas y evita nuevas solicitudes seguidas. El score cambia con tu comportamiento de pago.",
    });
  }

  // --- Resiliencia (prueba de estrés): solo puede llevar a "atención", nunca a "no cumple" ---
  const escenario = entrada.estres ?? {
    reduccionIngresoPct: params.estresReduccionIngresoPct,
    aumentoCuotasPct: params.estresAumentoCuotasPct,
  };
  const ingresoEstres = entrada.ingresoMensual * (1 - escenario.reduccionIngresoPct / 100);
  const cuotasEstres = cuotasTotales * (1 + escenario.aumentoCuotasPct / 100);
  const ratioEstres = ingresoEstres > 0 ? (cuotasEstres / ingresoEstres) * 100 : null;
  const disponibleEstres = gastos === null ? null : ingresoEstres - gastos - cuotasEstres;
  const resiste =
    ratioEstres !== null &&
    estadoMaximo(ratioEstres, max, 0) === "cumple" &&
    (disponibleEstres === null || estadoMinimo(disponibleEstres, 0) === "cumple");
  factores.push({
    id: "resiliencia",
    dimension: "resiliencia",
    etiqueta: "Prueba de estrés",
    estado: resiste ? "cumple" : "atencion",
    detalle:
      `Si tu ingreso bajara ${escenario.reduccionIngresoPct} % y tus cuotas subieran ${escenario.aumentoCuotasPct} %, ` +
      (ratioEstres === null ? "no tendrías ingreso para cubrir cuotas." : `tus cuotas serían ${num(ratioEstres, 1)} % del ingreso`) +
      (disponibleEstres === null ? "." : ` y te quedarían ${num(disponibleEstres, 2)} USD al mes.`) +
      " Es un escenario hipotético, no una predicción.",
    recomendacion: resiste ? null : "Ten un fondo de reserva o pide una cuota menor para resistir una baja de ingresos.",
  });

  // --- Preparación documental: informa, pero no cambia el nivel (decisión de la metodología v1.1) ---
  const docs = entrada.documentos ?? null;
  if (docs === null || docs.total === 0) {
    factores.push({
      id: "documentos",
      dimension: "documentos",
      etiqueta: "Documentos",
      estado: "sin_dato",
      soloInforma: true,
      detalle: "No indicaste qué documentos puedes respaldar.",
      recomendacion: "Marca la lista de documentos para saber qué te falta reunir.",
    });
  } else {
    const completo = docs.listos >= docs.total;
    factores.push({
      id: "documentos",
      dimension: "documentos",
      etiqueta: "Documentos",
      estado: completo ? "cumple" : "atencion",
      soloInforma: true,
      detalle: `Puedes respaldar ${docs.listos} de ${docs.total} documentos de la lista.`,
      recomendacion: completo ? null : "Reúne los documentos que faltan antes de solicitar: las entidades piden respaldos de ingresos y de identidad.",
    });
  }

  return {
    nivel: nivelDesdeFactores(factores),
    factores,
    ratioCuotasPct: ratio,
    ingresoDisponible: disponible,
    ratioEstresPct: ratioEstres,
    errores: [],
  };
}
