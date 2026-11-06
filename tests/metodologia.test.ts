import { describe, expect, it } from "vitest";

import { CASOS_DE_REFERENCIA, REGLAS_GENERALES, REGLAS_METODOLOGIA, METODOLOGIA } from "@/lib/metodologia";
import personas from "./casos/personas.json";
import empresas from "./casos/empresas.json";
import { ESCENARIOS, PARAMETROS_EMPRESA, PARAMETROS_PERSONA } from "@/lib/parametros";

describe("metodología v1.1", () => {
  const registrados = new Set(REGLAS_METODOLOGIA.map((r) => r.parametro));

  it("todo parámetro de personas tiene su regla con origen", () => {
    for (const k of Object.keys(PARAMETROS_PERSONA)) expect(registrados.has(`persona.${k}`), `falta persona.${k}`).toBe(true);
  });
  it("todo parámetro de empresas y cada regla de ratio tiene su regla con origen", () => {
    for (const k of Object.keys(PARAMETROS_EMPRESA)) {
      if (k === "reglasRatios") continue;
      expect(registrados.has(`empresa.${k}`), `falta empresa.${k}`).toBe(true);
    }
    for (const k of Object.keys(PARAMETROS_EMPRESA.reglasRatios)) expect(registrados.has(`empresa.reglasRatios.${k}`), `falta ${k}`).toBe(true);
  });
  it("cada escenario distinto del base tiene su regla", () => {
    for (const e of ESCENARIOS.filter((x) => x.id !== "base")) expect(registrados.has(`escenarios.${e.id}`)).toBe(true);
  });
  it("no hay reglas duplicadas ni reglas sin parámetro real", () => {
    expect(registrados.size).toBe(REGLAS_METODOLOGIA.length);
    for (const r of REGLAS_METODOLOGIA) {
      const [ambito, ...resto] = r.parametro.split(".");
      if (ambito === "persona") expect(resto[0] && resto[0] in PARAMETROS_PERSONA, r.parametro).toBe(true);
      if (ambito === "empresa") {
        const ok = resto[0] === "reglasRatios" ? resto[1] !== undefined && resto[1] in PARAMETROS_EMPRESA.reglasRatios : (resto[0] as string) in PARAMETROS_EMPRESA;
        expect(ok, r.parametro).toBe(true);
      }
    }
  });
  it("un umbral que no es norma ni convención declara que no tiene respaldo o lo cita", () => {
    for (const r of REGLAS_METODOLOGIA) {
      if (r.origen === "supuesto") expect(r.fuente, r.parametro).toBeNull();
      else expect(r.fuente, r.parametro).not.toBeNull();
    }
  });
  it("la versión tiene formato mayor.menor", () => expect(METODOLOGIA.version).toMatch(/^\d+\.\d+$/));
  it("los umbrales que decidió el analista figuran como aprobados con su valor", () => {
    const por = (p: string) => REGLAS_METODOLOGIA.find((r) => r.parametro === p)!;
    expect(PARAMETROS_PERSONA.maxCuotasSobreIngresoPct).toBe(30);
    expect(PARAMETROS_PERSONA.margenAtencionPct).toBe(20);
    expect(PARAMETROS_EMPRESA.reglasRatios.endeudamiento?.valor).toBe(70);
    for (const p of ["persona.maxCuotasSobreIngresoPct", "persona.margenAtencionPct", "empresa.reglasRatios.endeudamiento", "empresa.dscrMinimoReferencial"]) {
      expect(por(p).aprobado, p).toBe(true);
      expect(por(p).afectaNivel, p).toBe(true);
    }
  });
  it("las reglas generales (frontera, documentos, estrés, simulador) están registradas", () => {
    expect(REGLAS_GENERALES.map((r) => r.id)).toEqual(["frontera", "documentos", "estres", "simulador"]);
  });
  it("la cifra de casos de referencia coincide con las hojas", () => {
    expect(CASOS_DE_REFERENCIA).toBe(personas.length + empresas.length);
  });
  it("todos los umbrales están aprobados", () => {
    expect(REGLAS_METODOLOGIA.filter((r) => !r.aprobado).map((r) => r.parametro)).toEqual([]);
  });
});
