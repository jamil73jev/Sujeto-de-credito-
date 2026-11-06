import { describe, expect, it } from "vitest";

import { enElLimite, estadoMaximo, estadoMinimo, peorEstado } from "@/lib/umbrales";

describe("estadoMinimo (más es mejor)", () => {
  it("por encima cumple; justo en el límite es atención; por debajo, lo indicado", () => {
    expect(estadoMinimo(7, 6)).toBe("cumple");
    expect(estadoMinimo(6, 6)).toBe("atencion");
    expect(estadoMinimo(5, 6)).toBe("no_cumple");
    expect(estadoMinimo(5, 6, "atencion")).toBe("atencion");
  });
  it("con la frontera apagada, el límite exacto cumple", () => {
    expect(estadoMinimo(6, 6, "no_cumple", false)).toBe("cumple");
  });
  it("no se confunde por la coma flotante", () => {
    expect(estadoMinimo(0.1 + 0.2, 0.3)).toBe("atencion");
  });
});

describe("estadoMaximo (menos es mejor)", () => {
  it("por debajo cumple; justo en el máximo es atención; hasta el margen inclusive es atención; más allá no cumple", () => {
    expect(estadoMaximo(29.9, 30, 20)).toBe("cumple");
    expect(estadoMaximo(30, 30, 20)).toBe("atencion");
    expect(estadoMaximo(50, 30, 20)).toBe("atencion");
    expect(estadoMaximo(50.1, 30, 20)).toBe("no_cumple");
  });
  it("sin margen, por encima del máximo no cumple", () => {
    expect(estadoMaximo(70, 70)).toBe("atencion");
    expect(estadoMaximo(70.1, 70)).toBe("no_cumple");
  });
  it("con la frontera apagada, el máximo exacto cumple", () => {
    expect(estadoMaximo(30, 30, 20, false)).toBe("cumple");
  });
});

describe("auxiliares", () => {
  it("enElLimite compara con tolerancia de coma flotante", () => {
    expect(enElLimite(0.1 + 0.2, 0.3)).toBe(true);
    expect(enElLimite(0.31, 0.3)).toBe(false);
  });
  it("peorEstado elige el más grave", () => {
    expect(peorEstado("cumple", "atencion")).toBe("atencion");
    expect(peorEstado("no_cumple", "atencion")).toBe("no_cumple");
    expect(peorEstado("sin_dato", "cumple")).toBe("sin_dato");
  });
});
