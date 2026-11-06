/** Tasa mensual equivalente a una tasa efectiva anual (TEA) expresada en %. */
export function tasaMensualDesdeTea(teaPct: number): number {
  return Math.pow(1 + teaPct / 100, 1 / 12) - 1;
}

/**
 * Cuota mensual de un crédito con cuotas iguales (sistema francés).
 * Estimación referencial: no incluye seguros, comisiones ni impuestos.
 */
export function cuotaMensual(monto: number, teaPct: number, meses: number): number {
  if (!(monto > 0) || !(meses > 0) || teaPct < 0 || !Number.isFinite(monto + teaPct + meses)) {
    return NaN;
  }
  const i = tasaMensualDesdeTea(teaPct);
  if (i === 0) return monto / meses;
  return (monto * i) / (1 - Math.pow(1 + i, -meses));
}

/** Monto máximo financiable para una cuota mensual dada. */
export function montoMaximoPorCuota(cuota: number, teaPct: number, meses: number): number {
  if (!(cuota > 0) || !(meses > 0) || teaPct < 0 || !Number.isFinite(cuota + teaPct + meses)) {
    return NaN;
  }
  const i = tasaMensualDesdeTea(teaPct);
  if (i === 0) return cuota * meses;
  return (cuota * (1 - Math.pow(1 + i, -meses))) / i;
}

export interface CostoCredito {
  cuota: number;
  totalPagado: number;
  interesTotal: number;
}

/** Cuota, total pagado e intereses de un crédito. No incluye comisiones, seguros ni impuestos. */
export function costoCredito(monto: number, teaPct: number, meses: number): CostoCredito | null {
  const cuota = cuotaMensual(monto, teaPct, meses);
  if (!Number.isFinite(cuota)) return null;
  const totalPagado = cuota * meses;
  return { cuota, totalPagado, interesTotal: totalPagado - monto };
}
