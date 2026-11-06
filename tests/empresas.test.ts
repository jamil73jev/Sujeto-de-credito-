import { describe, expect, it } from "vitest";

import { calcularRatios, compararConSector, estimarEmpresa, validarEmpresa, type EntradaEmpresa } from "@/lib/empresas";
import type { Benchmark } from "@/lib/schemas";

const base: EntradaEmpresa = {
  ventasAnuales: 500_000,
  activoCorriente: 200_000,
  pasivoCorriente: 100_000,
  inventarios: 50_000,
  activoTotal: 400_000,
  pasivoTotal: 200_000,
  patrimonio: 200_000,
  utilidadNeta: 25_000,
  utilidadOperativa: 40_000,
  gastosFinancieros: 10_000,
  cuentasPorCobrar: 50_000,
  flujoDisponible: 60_000,
  servicioDeuda: 40_000,
  aniosRuc: 5,
  cumplimientoTributario: "si",
  obligacionesPatronales: "si",
  estadosFinancierosPresentados: "si",
};

describe("calcularRatios", () => {
  it("calcula los ratios con las fórmulas del dataset", () => {
    const r = calcularRatios(base);
    expect(r.razon_corriente).toBeCloseTo(2, 10);
    expect(r.prueba_acida).toBeCloseTo(1.5, 10);
    expect(r.endeudamiento).toBeCloseTo(50, 10);
    expect(r.apalancamiento).toBeCloseTo(1, 10);
    expect(r.margen_neto).toBeCloseTo(5, 10);
    expect(r.roa).toBeCloseTo(6.25, 10);
    expect(r.roe).toBeCloseTo(12.5, 10);
    expect(r.cobertura_intereses).toBeCloseTo(4, 10);
    expect(r.rotacion_activos).toBeCloseTo(1.25, 10);
    expect(r.dias_cobranza).toBeCloseTo(36.5, 10);
    expect(r.dscr).toBeCloseTo(1.5, 10);
  });

  it("DSCR y días de cobranza quedan 'no calculables' sin sus datos (no se sustituyen por otro ratio)", () => {
    const r = calcularRatios({ ...base, flujoDisponible: null, servicioDeuda: null, cuentasPorCobrar: null });
    expect(r.dscr).toBeNull();
    expect(r.dias_cobranza).toBeNull();
    expect(r.cobertura_intereses).toBeCloseTo(4, 10); // sigue siendo un indicador distinto
  });

  it("cuentas por cobrar en cero dan 0 días, no 'no calculable'", () => {
    expect(calcularRatios({ ...base, cuentasPorCobrar: 0 }).dias_cobranza).toBe(0);
  });

  it("devuelve null cuando falta el dato o el denominador no es positivo", () => {
    const r = calcularRatios({
      ...base,
      inventarios: null,
      utilidadOperativa: null,
      gastosFinancieros: null,
      patrimonio: -10_000,
      pasivoTotal: 410_000,
    });
    expect(r.prueba_acida).toBeNull();
    expect(r.cobertura_intereses).toBeNull();
    expect(r.apalancamiento).toBeNull();
    expect(r.roe).toBeNull();
  });

  it("sin gastos financieros la cobertura no se calcula (no hay división por cero)", () => {
    expect(calcularRatios({ ...base, gastosFinancieros: 0 }).cobertura_intereses).toBeNull();
  });
});

describe("estimarEmpresa", () => {
  it("empresa sana => favorable", () => {
    const r = estimarEmpresa(base);
    expect(r.nivel).toBe("favorable");
    expect(r.ratios?.razon_corriente).toBeCloseTo(2, 10);
  });

  it("pérdidas => débil", () => {
    expect(estimarEmpresa({ ...base, utilidadNeta: -5_000 }).nivel).toBe("debil");
  });

  it("liquidez bajo 1 => débil", () => {
    expect(estimarEmpresa({ ...base, pasivoCorriente: 250_000, pasivoTotal: 250_000, patrimonio: 150_000 }).nivel).toBe("debil");
  });

  it("RUC reciente => condicionado; sin RUC un año => débil", () => {
    expect(estimarEmpresa({ ...base, aniosRuc: 2 }).nivel).toBe("condicionado");
    expect(estimarEmpresa({ ...base, aniosRuc: 0 }).nivel).toBe("debil");
  });

  it("deuda con el SRI => débil; no saber => condicionado", () => {
    expect(estimarEmpresa({ ...base, cumplimientoTributario: "no" }).nivel).toBe("debil");
    expect(estimarEmpresa({ ...base, obligacionesPatronales: "no_se" }).nivel).toBe("condicionado");
  });

  it("balance que no cuadra => insuficiente con el código correspondiente", () => {
    const r = estimarEmpresa({ ...base, patrimonio: 50_000 });
    expect(r.nivel).toBe("insuficiente");
    expect(r.errores).toContainEqual({ campo: "activoTotal", codigo: "balance_no_cuadra" });
  });

  it("patrimonio negativo es válido si el balance cuadra, pero resulta débil", () => {
    const r = estimarEmpresa({ ...base, pasivoTotal: 450_000, patrimonio: -50_000 });
    expect(r.nivel).toBe("debil");
  });
});

describe("validarEmpresa", () => {
  it("exige los campos obligatorios y permite omitir los opcionales", () => {
    const errores = validarEmpresa({
      ...base,
      inventarios: null,
      utilidadOperativa: null,
      gastosFinancieros: null,
      cuentasPorCobrar: null,
      flujoDisponible: null,
      servicioDeuda: null,
    });
    expect(errores).toEqual([]);
    expect(validarEmpresa({}).length).toBeGreaterThan(5);
  });

  it("rechaza ventas no positivas y números inválidos", () => {
    const errores = validarEmpresa({ ...base, ventasAnuales: 0, activoCorriente: Number.NaN });
    expect(errores.map((e) => e.campo).sort()).toEqual(["activoCorriente", "ventasAnuales"]);
  });
});

describe("compararConSector", () => {
  const ratios = calcularRatios(base);
  const traza = {
    fuente_nombre: "prueba",
    fuente_url: "https://example.com",
    fecha_publicacion: null,
    fecha_consulta: "2026-01-01",
    tipo: "hecho" as const,
    confianza: "alta" as const,
    desactualizado: false,
  };
  const bench = (periodo: string, p25: number, mediana: number, p75: number): Benchmark => ({
    ciiu: "G4711",
    tamano: "pequena",
    periodo,
    ratio_id: "razon_corriente",
    p10: p25 - 0.1,
    p25,
    mediana,
    p75,
    p90: p75 + 0.1,
    n_empresas: 120,
    traza,
  });

  it("sin benchmarks => no disponible (no inventa datos)", () => {
    const r = compararConSector(ratios, [], { ciiu: "G4711", tamano: "pequena" });
    expect(r.disponible).toBe(false);
  });

  it("ubica al ratio en la banda correcta usando el periodo más reciente", () => {
    const r = compararConSector(ratios, [bench("2023", 5, 6, 7), bench("2024", 0.8, 1.2, 1.6)], {
      ciiu: "G4711",
      tamano: "pequena",
    });
    expect(r.disponible).toBe(true);
    if (r.disponible) {
      expect(r.periodo).toBe("2024");
      expect(r.comparaciones).toHaveLength(1);
      expect(r.comparaciones[0]?.banda).toBe("sobre_p75"); // 2.0 > 1.6
    }
  });

  it("otro sector o tamaño => no disponible", () => {
    const r = compararConSector(ratios, [bench("2024", 1, 2, 3)], { ciiu: "A0111", tamano: "pequena" });
    expect(r.disponible).toBe(false);
  });
});
