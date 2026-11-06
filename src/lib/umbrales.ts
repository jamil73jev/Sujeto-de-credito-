import { FRONTERA_EN_ATENCION } from "./parametros";
import type { EstadoFactor } from "./tipos";

/** Evita que el error de coma flotante decida un resultado (0,1 + 0,2 ≠ 0,3). Se compara a 9 decimales. */
const r = (v: number) => Math.round(v * 1e9) / 1e9;

/**
 * Criterio de «mínimo»: más es mejor (meses, score, razón corriente, DSCR...).
 * - por encima del mínimo: cumple.
 * - exactamente en el mínimo: atención si rige la regla de frontera; si no, cumple.
 * - por debajo: el estado indicado en `bajoMinimo` (por defecto «no cumple»).
 */
export function estadoMinimo(
  valor: number,
  minimo: number,
  bajoMinimo: EstadoFactor = "no_cumple",
  frontera: boolean = FRONTERA_EN_ATENCION,
): EstadoFactor {
  if (r(valor) > r(minimo)) return "cumple";
  if (r(valor) === r(minimo)) return frontera ? "atencion" : "cumple";
  return bajoMinimo;
}

/**
 * Criterio de «máximo»: menos es mejor (cuotas sobre ingreso, endeudamiento).
 * - por debajo del máximo: cumple.
 * - exactamente en el máximo: atención si rige la regla de frontera; si no, cumple.
 * - hasta el máximo más el margen (inclusive): atención.
 * - más allá: no cumple.
 */
export function estadoMaximo(
  valor: number,
  maximo: number,
  margen: number = 0,
  frontera: boolean = FRONTERA_EN_ATENCION,
): EstadoFactor {
  if (r(valor) < r(maximo)) return "cumple";
  if (r(valor) === r(maximo)) return frontera ? "atencion" : "cumple";
  return r(valor) <= r(maximo + margen) ? "atencion" : "no_cumple";
}

/** True si el valor cae justo en el límite (para avisarlo en el texto). */
export const enElLimite = (valor: number, limite: number) => r(valor) === r(limite);

/** El peor de dos estados, para combinar criterios. */
const ORDEN: Record<EstadoFactor, number> = { cumple: 0, sin_dato: 0, atencion: 1, no_cumple: 2 };
export const peorEstado = (a: EstadoFactor, b: EstadoFactor): EstadoFactor => (ORDEN[b] > ORDEN[a] ? b : a);
