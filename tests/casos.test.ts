import { describe, expect, it } from "vitest";

import { estimarEmpresa, type EntradaEmpresa } from "@/lib/empresas";
import { estimarPersona, type EntradaPersona } from "@/lib/personas";

import personas from "./casos/personas.json";
import empresas from "./casos/empresas.json";

/**
 * Casos de referencia: los resultados esperados salen de docs/casos-de-referencia.xlsx,
 * una hoja de cálculo con fórmulas que reimplementa la metodología sin usar el código del sitio.
 * Para regenerarlos: python3 scripts/casos/generar_xlsx.py && soffice (recalcular) && python3 scripts/casos/exportar_json.py
 */
const cerca = (obtenido: number | null, esperado: number | null) => {
  if (esperado === null) return expect(obtenido).toBeNull();
  expect(obtenido).not.toBeNull();
  expect(Math.abs((obtenido as number) - esperado)).toBeLessThanOrEqual(1e-9 * Math.max(1, Math.abs(esperado)));
};

describe("casos de referencia · personas", () => {
  it("hay al menos 30 casos", () => expect(personas.length).toBeGreaterThanOrEqual(30));
  for (const c of personas) {
    it(`${c.id}: ${c.descripcion}`, () => {
      const r = estimarPersona(c.entrada as unknown as EntradaPersona);
      expect(r.nivel).toBe(c.esperado.nivel);
      if (c.esperado.nivel === "insuficiente") return;
      cerca(r.ratioCuotasPct, c.esperado.ratioCuotasPct);
      cerca(r.ingresoDisponible, c.esperado.ingresoDisponible);
      cerca(r.ratioEstresPct, c.esperado.ratioEstresPct);
      for (const [id, estado] of Object.entries(c.esperado.estados)) {
        expect(r.factores.find((f) => f.id === id)?.estado, `${c.id} · ${id}`).toBe(estado);
      }
    });
  }
});

describe("casos de referencia · empresas", () => {
  it("hay al menos 20 casos", () => expect(empresas.length).toBeGreaterThanOrEqual(20));
  for (const c of empresas) {
    it(`${c.id}: ${c.descripcion}`, () => {
      const r = estimarEmpresa(c.entrada as unknown as EntradaEmpresa);
      expect(r.nivel).toBe(c.esperado.nivel);
      if (c.esperado.nivel === "insuficiente") return;
      for (const [id, valor] of Object.entries(c.esperado.ratios)) {
        cerca((r.ratios as unknown as Record<string, number | null>)[id] ?? null, valor as number | null);
      }
      for (const [id, estado] of Object.entries(c.esperado.estados)) {
        const f = r.factores.find((x) => x.id === id);
        if (estado === "omitido") expect(f, `${c.id} · ${id}`).toBeUndefined();
        else expect(f?.estado, `${c.id} · ${id}`).toBe(estado);
      }
    });
  }
});
