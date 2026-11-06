import type { Dimension, EstadoFactor, Factor, NivelResultado } from "./tipos";

/** Nombre corto de cada dimensión, para los ejes del radar. */
export const DIMENSION_CORTA: Record<Dimension, string> = {
  elegibilidad: "Requisitos",
  capacidad_pago: "Pago",
  historial: "Historial",
  resiliencia: "Estrés",
  documentos: "Documentos",
  liquidez: "Liquidez",
  solvencia: "Solvencia",
  rentabilidad: "Rentabilidad",
  cumplimiento: "Cumplimiento",
};

/** Posición del marcador en la escala (0–1) por nivel; "insuficiente" no tiene posición. */
export const POSICION_NIVEL: Record<NivelResultado, number | null> = {
  debil: 1 / 6,
  condicionado: 0.5,
  favorable: 5 / 6,
  insuficiente: null,
};

const PESO: Record<Exclude<EstadoFactor, "sin_dato">, number> = { cumple: 1, atencion: 0.5, no_cumple: 0.12 };

export interface ResumenDimension {
  dimension: Dimension;
  /** 0–1 para dibujar el radar. No es un puntaje: solo resume cuántos criterios de la dimensión se cumplen. */
  valor: number;
  /** Peor estado de la dimensión; "sin_dato" si ningún criterio tenía datos. */
  estado: EstadoFactor;
  /** Todos los criterios de la dimensión informan pero no cuentan para el nivel. */
  soloInforma: boolean;
  factores: Factor[];
}

const ORDEN_PEOR: EstadoFactor[] = ["no_cumple", "atencion", "cumple", "sin_dato"];

/** Agrupa los factores por dimensión (en orden de aparición) y resume cada una. */
export function resumirDimensiones(factores: Factor[]): ResumenDimension[] {
  const grupos = new Map<Dimension, Factor[]>();
  for (const f of factores) grupos.set(f.dimension, [...(grupos.get(f.dimension) ?? []), f]);
  return [...grupos.entries()].map(([dimension, fs]) => {
    const conDato = fs.filter((f): f is Factor & { estado: keyof typeof PESO } => f.estado !== "sin_dato");
    const valor = conDato.length === 0 ? 0 : conDato.reduce((s, f) => s + PESO[f.estado], 0) / conDato.length;
    const estado = ORDEN_PEOR.find((e) => fs.some((f) => f.estado === e)) ?? "sin_dato";
    return { dimension, valor, estado, soloInforma: fs.every((f) => f.soloInforma === true), factores: fs };
  });
}
