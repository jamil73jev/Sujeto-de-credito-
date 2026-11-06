/**
 * Cálculo de percentiles sectoriales a partir de balances reales (nunca valores de ejemplo).
 * Lógica pura: el script scripts/build-benchmarks.ts solo lee el CSV y escribe el JSON.
 */
import { MUESTRA_MINIMA_BENCHMARK } from "./parametros";

export type Tamano = "micro" | "pequena" | "mediana" | "grande";

export interface FilaEmpresa {
  ciiu: string;
  tamano: Tamano;
  periodo: string;
  /** Valor de cada ratio; null si no es calculable para esa empresa. */
  ratios: Record<string, number | null>;
}

export interface CeldaBenchmark {
  ciiu: string;
  tamano: Tamano;
  periodo: string;
  ratio_id: string;
  p10: number;
  p25: number;
  mediana: number;
  p75: number;
  p90: number;
  n_empresas: number;
}

/** Percentil por interpolación lineal (método habitual de las hojas de cálculo, PERCENTIL.INC). */
export function percentil(ordenados: number[], p: number): number {
  if (ordenados.length === 0) throw new Error("percentil: lista vacía");
  if (p < 0 || p > 100) throw new Error("percentil: p fuera de 0-100");
  const pos = (p / 100) * (ordenados.length - 1);
  const bajo = Math.floor(pos);
  const alto = Math.ceil(pos);
  const a = ordenados[bajo] as number;
  const b = ordenados[alto] as number;
  return a + (b - a) * (pos - bajo);
}

function resumir(valores: number[]) {
  const o = [...valores].sort((x, y) => x - y);
  return {
    p10: percentil(o, 10),
    p25: percentil(o, 25),
    mediana: percentil(o, 50),
    p75: percentil(o, 75),
    p90: percentil(o, 90),
    n_empresas: o.length,
  };
}

/**
 * Sube un nivel en el código CIIU quitando el último dígito: C1071.01 → C10710 → C1071 → C107 → C10 → C1 → C → null.
 * Los códigos se manejan sin punto salvo la entrada; la salida nunca lleva punto.
 */
export function ciiuSuperior(ciiu: string): string | null {
  const limpio = ciiu.trim().toUpperCase();
  const m = /^([A-Z])(\d*)(?:\.(\d+))?$/.exec(limpio);
  if (!m) return null;
  const letra = m[1] as string;
  const digitos = (m[2] ?? "") + (m[3] ?? "");
  if (digitos.length === 0) return null;
  return letra + digitos.slice(0, -1);
}

/**
 * Calcula percentiles por CIIU × tamaño × periodo × ratio. Para cada nivel de actividad (código completo y
 * cada prefijo superior hasta la sección) se agrupan todas las empresas que cuelgan de él, y solo se publica
 * la celda si tiene al menos `minimo` empresas con el ratio calculable. Quien consulte busca su CIIU y,
 * si no existe esa celda, sube al nivel superior (ver compararConSector).
 */
export function calcularBenchmarks(filas: FilaEmpresa[], minimo: number = MUESTRA_MINIMA_BENCHMARK): CeldaBenchmark[] {
  const celdas = new Map<string, { ciiu: string; tamano: Tamano; periodo: string; ratio: string; valores: number[] }>();

  for (const f of filas) {
    for (const [ratio, valor] of Object.entries(f.ratios)) {
      if (valor === null || valor === undefined || !Number.isFinite(valor)) continue;
      let ciiu: string | null = f.ciiu.trim().toUpperCase().replace(".", "");
      while (ciiu !== null) {
        const k = `${ciiu}|${f.tamano}|${f.periodo}|${ratio}`;
        const celda = celdas.get(k) ?? { ciiu, tamano: f.tamano, periodo: f.periodo, ratio, valores: [] };
        celda.valores.push(valor);
        celdas.set(k, celda);
        ciiu = ciiuSuperior(ciiu);
      }
    }
  }

  const salida: CeldaBenchmark[] = [];
  for (const c of celdas.values()) {
    if (c.valores.length < minimo) continue;
    salida.push({ ciiu: c.ciiu, tamano: c.tamano, periodo: c.periodo, ratio_id: c.ratio, ...resumir(c.valores) });
  }
  return salida.sort(
    (a, b) =>
      a.ciiu.localeCompare(b.ciiu) ||
      a.tamano.localeCompare(b.tamano) ||
      a.periodo.localeCompare(b.periodo) ||
      a.ratio_id.localeCompare(b.ratio_id),
  );
}
