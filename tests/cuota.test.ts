import { describe, expect, it } from "vitest";

import { costoCredito, cuotaMensual, montoMaximoPorCuota, tasaMensualDesdeTea } from "@/lib/cuota";

describe("cuota", () => {
  it("convierte TEA a tasa mensual equivalente", () => {
    // (1 + i)^12 debe recuperar 1 + TEA
    const i = tasaMensualDesdeTea(12);
    expect(Math.pow(1 + i, 12)).toBeCloseTo(1.12, 10);
  });

  it("con tasa 0 divide el monto entre los meses", () => {
    expect(cuotaMensual(1200, 0, 12)).toBeCloseTo(100, 10);
  });

  it("con tasa positiva la cuota es mayor que monto/meses", () => {
    const c = cuotaMensual(10_000, 15.84, 36);
    expect(c).toBeGreaterThan(10_000 / 36);
    expect(c).toBeLessThan(10_000 / 36 + 10_000 * 0.02);
  });

  it("montoMaximoPorCuota es la inversa de cuotaMensual", () => {
    const monto = 8_500;
    const c = cuotaMensual(monto, 9.34, 48);
    expect(montoMaximoPorCuota(c, 9.34, 48)).toBeCloseTo(monto, 6);
  });

  it("costoCredito: total = cuota × meses e intereses = total − monto", () => {
    const c = costoCredito(10_000, 15.69, 36);
    expect(c).not.toBeNull();
    if (c) {
      expect(c.totalPagado).toBeCloseTo(c.cuota * 36, 8);
      expect(c.interesTotal).toBeCloseTo(c.totalPagado - 10_000, 8);
      expect(c.interesTotal).toBeGreaterThan(0);
    }
  });

  it("costoCredito con tasa 0 no cobra intereses; con datos inválidos devuelve null", () => {
    expect(costoCredito(1200, 0, 12)?.interesTotal).toBeCloseTo(0, 10);
    expect(costoCredito(0, 10, 12)).toBeNull();
  });

  it("una tasa mayor da más intereses al mismo plazo (máxima vs referencial)", () => {
    const ref = costoCredito(10_000, 15.69, 36);
    const max = costoCredito(10_000, 16.77, 36);
    expect(max && ref && max.interesTotal > ref.interesTotal).toBe(true);
  });

  it("devuelve NaN con entradas inválidas", () => {
    expect(cuotaMensual(-1, 10, 12)).toBeNaN();
    expect(cuotaMensual(1000, -5, 12)).toBeNaN();
    expect(cuotaMensual(1000, 10, 0)).toBeNaN();
    expect(montoMaximoPorCuota(0, 10, 12)).toBeNaN();
  });
});
