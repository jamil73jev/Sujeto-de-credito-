export type NivelResultado = "favorable" | "condicionado" | "debil" | "insuficiente";
export type EstadoFactor = "cumple" | "atencion" | "no_cumple" | "sin_dato";

/** Dimensiones en las que se agrupan los factores, en lugar de un puntaje único. */
export type Dimension =
  | "elegibilidad"
  | "capacidad_pago"
  | "historial"
  | "resiliencia"
  | "documentos"
  | "liquidez"
  | "solvencia"
  | "rentabilidad"
  | "cumplimiento";

export const ETIQUETA_DIMENSION: Record<Dimension, string> = {
  elegibilidad: "Requisitos básicos",
  capacidad_pago: "Capacidad de pago",
  historial: "Historial declarado",
  resiliencia: "Resiliencia ante cambios",
  documentos: "Preparación documental",
  liquidez: "Liquidez",
  solvencia: "Solvencia",
  rentabilidad: "Rentabilidad y cobertura",
  cumplimiento: "Cumplimiento y documentos",
};

export interface Factor {
  id: string;
  dimension: Dimension;
  etiqueta: string;
  estado: EstadoFactor;
  detalle: string;
  recomendacion: string | null;
  /** Aparece en el resultado pero no cuenta para el nivel (por ejemplo, los documentos). */
  soloInforma?: boolean;
}

export type CodigoError = "campo_requerido" | "numero_invalido" | "balance_no_cuadra";

export interface ErrorCampo {
  campo: string;
  codigo: CodigoError;
}

/** Regla común (los factores marcados `soloInforma` no cuentan): cualquier "no cumple" => débil; cualquier "atención" => condicionado; si no, favorable. */
export function nivelDesdeFactores(factores: Factor[]): Exclude<NivelResultado, "insuficiente"> {
  const cuentan = factores.filter((f) => !f.soloInforma);
  if (cuentan.some((f) => f.estado === "no_cumple")) return "debil";
  if (cuentan.some((f) => f.estado === "atencion")) return "condicionado";
  return "favorable";
}
