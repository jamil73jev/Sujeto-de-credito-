import { describe, expect, it } from "vitest";

import { escenariosEmpresa, escenariosPersona } from "@/lib/escenarios";
import { estimarPersona, type EntradaPersona } from "@/lib/personas";
import { PARAMETROS_PERSONA } from "@/lib/parametros";

import personas from "./casos/personas.json";

const PESO = { cumple: 0, sin_dato: 0, atencion: 1, no_cumple: 2 } as const;

describe("escenarios de personas", () => {
  it("el escenario base coincide con el peor de los criterios de cuotas e ingreso disponible en todos los casos", () => {
    for (const c of personas) {
      if (c.esperado.nivel === "insuficiente") continue;
      const e = c.entrada as unknown as EntradaPersona;
      const r = estimarPersona(e);
      const peor = Math.max(...["endeudamiento", "ingreso_disponible"].map((id) => PESO[r.factores.find((f) => f.id === id)!.estado]));
      const base = escenariosPersona({
        ingresoMensual: e.ingresoMensual,
        gastosEsenciales: e.gastosEsenciales ?? null,
        cuotasMensualesActuales: e.cuotasMensualesActuales,
        cuotaNuevaEstimada: e.cuotaNuevaEstimada,
      }).escenarios[0]!;
      expect(PESO[base.estado], c.id).toBe(peor);
    }
  });

  it("los escenarios empeoran o igualan el resultado a medida que se endurecen", () => {
    const { escenarios } = escenariosPersona({ ingresoMensual: 1000, gastosEsenciales: 300, cuotasMensualesActuales: 150, cuotaNuevaEstimada: 150 });
    const pesos = escenarios.map((x) => PESO[x.estado]);
    expect(pesos).toEqual([...pesos].sort((a, b) => a - b));
  });

  it("la sensibilidad es coherente con el máximo de cuotas", () => {
    const s = escenariosPersona({ ingresoMensual: 1000, gastosEsenciales: null, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 100 }).sensibilidad;
    expect(s.cuotaNuevaMaxima).toBeCloseTo(200); // 30 % de 1000 menos 100 de cuotas actuales
    expect(s.ingresoMinimo).toBeCloseTo(666.6667, 3); // 200 / 0,30
    expect(s.caidaIngresoMaximaPct).toBeCloseTo(33.3333, 3); // 1 - 200/300
    // Aplicar exactamente esa caída deja las cuotas justo en el máximo.
    const ingreso = 1000 * (1 - s.caidaIngresoMaximaPct / 100);
    expect((200 / ingreso) * 100).toBeCloseTo(PARAMETROS_PERSONA.maxCuotasSobreIngresoPct);
  });

  it("si ya se supera el máximo, no hay margen", () => {
    const s = escenariosPersona({ ingresoMensual: 1000, gastosEsenciales: null, cuotasMensualesActuales: 300, cuotaNuevaEstimada: 300 }).sensibilidad;
    expect(s.caidaIngresoMaximaPct).toBe(0);
    expect(s.cuotaNuevaMaxima).toBe(0);
  });
});

describe("escenarios de personas: frontera", () => {
  it("un escenario con cuotas justo en el máximo queda en atención", () => {
    // 300 de cuotas sobre 1.000 de ingreso = 30 %; el escenario base no cambia nada
    const { escenarios } = escenariosPersona({ ingresoMensual: 1000, gastosEsenciales: null, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 200 });
    expect(escenarios[0]!.estado).toBe("atencion");
  });
  it("ingreso disponible exactamente cero queda en atención", () => {
    const { escenarios } = escenariosPersona({ ingresoMensual: 2000, gastosEsenciales: 1700, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 200 });
    expect(escenarios[0]!.estado).toBe("atencion");
  });
});

describe("escenarios de empresas", () => {
  it("sin flujo o sin servicio de la deuda no hay escenarios", () => {
    expect(escenariosEmpresa({ flujoDisponible: null, servicioDeuda: 100 })).toBeNull();
    expect(escenariosEmpresa({ flujoDisponible: 100, servicioDeuda: 0 })).toBeNull();
  });
  it("DSCR exactamente en el mínimo (1,2): atención; entre 1,0 y 1,2: atención; menos de 1,0: no cumple", () => {
    const estado = (flujo: number) => escenariosEmpresa({ flujoDisponible: flujo, servicioDeuda: 30000 })!.escenarios[0]!.estado;
    expect(estado(36000)).toBe("atencion");
    expect(estado(33000)).toBe("atencion");
    expect(estado(30000)).toBe("atencion");
    expect(estado(29999)).toBe("no_cumple");
    expect(estado(36001)).toBe("cumple");
  });
  it("calcula el DSCR por escenario y la sensibilidad", () => {
    const r = escenariosEmpresa({ flujoDisponible: 45000, servicioDeuda: 30000 })!;
    expect(r.escenarios[0]!.dscr).toBeCloseTo(1.5);
    expect(r.escenarios[1]!.dscr).toBeCloseTo((45000 * 0.9) / (30000 * 1.1)); // 1,227
    expect(r.escenarios[2]!.dscr).toBeCloseTo((45000 * 0.75) / (30000 * 1.2)); // 0,9375
    expect(r.escenarios.map((x) => x.estado)).toEqual(["cumple", "cumple", "no_cumple"]);
    expect(r.sensibilidad.caidaFlujoHasta1Pct).toBeCloseTo((1 - 30000 / 45000) * 100);
    expect(r.sensibilidad.caidaFlujoHastaMinimoPct).toBeCloseTo((1 - (1.2 * 30000) / 45000) * 100);
  });
});
