import { describe, expect, it } from "vitest";

import { POSICION_NIVEL, resumirDimensiones } from "../src/lib/panel";
import type { Factor } from "../src/lib/tipos";

const f = (id: string, dimension: Factor["dimension"], estado: Factor["estado"]): Factor => ({
  id,
  dimension,
  etiqueta: id,
  estado,
  detalle: "",
  recomendacion: null,
});

describe("resumirDimensiones", () => {
  it("agrupa por dimensión conservando el orden", () => {
    const r = resumirDimensiones([f("a", "capacidad_pago", "cumple"), f("b", "historial", "cumple"), f("c", "capacidad_pago", "cumple")]);
    expect(r.map((x) => x.dimension)).toEqual(["capacidad_pago", "historial"]);
    expect(r[0]?.factores).toHaveLength(2);
  });

  it("promedia solo los criterios con dato y toma el peor estado", () => {
    const [d] = resumirDimensiones([f("a", "liquidez", "cumple"), f("b", "liquidez", "atencion"), f("c", "liquidez", "sin_dato")]);
    expect(d?.valor).toBe(0.75);
    expect(d?.estado).toBe("atencion");
  });

  it("una dimensión sin datos queda en 0 y sin_dato", () => {
    const [d] = resumirDimensiones([f("a", "documentos", "sin_dato")]);
    expect(d).toMatchObject({ valor: 0, estado: "sin_dato" });
  });

  it("no cumple pesa poco pero visible y domina el estado", () => {
    const [d] = resumirDimensiones([f("a", "solvencia", "no_cumple"), f("b", "solvencia", "cumple")]);
    expect(d?.estado).toBe("no_cumple");
    expect(d?.valor).toBeGreaterThan(0);
    expect(d?.valor).toBeLessThan(0.6);
  });
});

describe("POSICION_NIVEL", () => {
  it("ordena débil < condicionado < favorable y no ubica insuficiente", () => {
    expect(POSICION_NIVEL.debil!).toBeLessThan(POSICION_NIVEL.condicionado!);
    expect(POSICION_NIVEL.condicionado!).toBeLessThan(POSICION_NIVEL.favorable!);
    expect(POSICION_NIVEL.insuficiente).toBeNull();
  });
});
