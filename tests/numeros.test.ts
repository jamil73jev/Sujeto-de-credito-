import { describe, expect, it } from "vitest";

import { formatoFecha, parseNumero } from "@/lib/numeros";

describe("parseNumero", () => {
  it("vacío => undefined", () => {
    expect(parseNumero("")).toBeUndefined();
    expect(parseNumero("   ")).toBeUndefined();
  });

  it("acepta punto o coma decimal", () => {
    expect(parseNumero("1234.5")).toBe(1234.5);
    expect(parseNumero("1234,5")).toBe(1234.5);
  });

  it("acepta miles con punto y decimal con coma", () => {
    expect(parseNumero("1.234,5")).toBe(1234.5);
  });

  it("acepta negativos", () => {
    expect(parseNumero("-50")).toBe(-50);
  });

  it("texto no numérico => NaN", () => {
    expect(parseNumero("abc")).toBeNaN();
    expect(parseNumero("12abc")).toBeNaN();
    expect(parseNumero("1e5")).toBeNaN();
  });
});

describe("formatoFecha", () => {
  it("formatea fechas y periodos sin desfase de zona horaria", () => {
    expect(formatoFecha("2026-11-05")).toMatch(/5/);
    expect(formatoFecha("2026-07")).toMatch(/2026/);
  });
});
