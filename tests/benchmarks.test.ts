import { describe, expect, it } from "vitest";

import { calcularBenchmarks, ciiuSuperior, percentil, type FilaEmpresa } from "../src/lib/benchmarks";
import { numero, parsearCsv } from "../src/lib/csv";
import { compararConSector, type Ratios } from "../src/lib/empresas";
import type { Benchmark } from "../src/lib/schemas";

const fila = (ciiu: string, valor: number | null, tamano: FilaEmpresa["tamano"] = "pequena"): FilaEmpresa => ({
  ciiu,
  tamano,
  periodo: "2025",
  ratios: { razon_corriente: valor },
});

describe("percentil", () => {
  it("interpola linealmente", () => {
    expect(percentil([1, 2, 3, 4, 5], 50)).toBe(3);
    expect(percentil([1, 2, 3, 4], 50)).toBe(2.5);
    expect(percentil([10, 20], 0)).toBe(10);
    expect(percentil([10, 20], 100)).toBe(20);
    expect(percentil([0, 10], 25)).toBe(2.5);
  });
  it("rechaza lista vacía", () => {
    expect(() => percentil([], 50)).toThrow();
  });
});

describe("ciiuSuperior", () => {
  it("sube un nivel hasta la sección y termina en null", () => {
    expect(ciiuSuperior("C1071.01")).toBe("C10710");
    expect(ciiuSuperior("C10710")).toBe("C1071");
    expect(ciiuSuperior("C1")).toBe("C");
    expect(ciiuSuperior("C")).toBeNull();
    expect(ciiuSuperior("???")).toBeNull();
  });
});

describe("calcularBenchmarks", () => {
  it("no publica celdas con menos del mínimo", () => {
    const filas = Array.from({ length: 29 }, (_, i) => fila("C1071", i + 1));
    expect(calcularBenchmarks(filas, 30)).toEqual([]);
  });

  it("publica con el mínimo y ordena los percentiles", () => {
    const filas = Array.from({ length: 30 }, (_, i) => fila("C1071", i + 1));
    const celdas = calcularBenchmarks(filas, 30).filter((c) => c.ciiu === "C1071");
    expect(celdas).toHaveLength(1);
    const c = celdas[0]!;
    expect(c.n_empresas).toBe(30);
    expect(c.mediana).toBe(15.5);
    expect(c.p10).toBeLessThanOrEqual(c.p25);
    expect(c.p25).toBeLessThanOrEqual(c.mediana);
    expect(c.p75).toBeLessThanOrEqual(c.p90);
  });

  it("agrega niveles superiores cuando el código exacto es pequeño", () => {
    const filas = [
      ...Array.from({ length: 20 }, (_, i) => fila("C1071.01", i + 1)),
      ...Array.from({ length: 20 }, (_, i) => fila("C1072.01", i + 100)),
    ];
    const celdas = calcularBenchmarks(filas, 30);
    expect(celdas.find((c) => c.ciiu === "C10710")).toBeUndefined();
    const sec = celdas.find((c) => c.ciiu === "C107");
    expect(sec?.n_empresas).toBe(40);
  });

  it("ignora valores nulos o no finitos y separa por tamaño", () => {
    const filas = [
      ...Array.from({ length: 30 }, (_, i) => fila("C1", i + 1)),
      fila("C1", null),
      fila("C1", Number.NaN),
      ...Array.from({ length: 5 }, (_, i) => fila("C1", i, "grande")),
    ];
    const celdas = calcularBenchmarks(filas, 30);
    const pequena = celdas.find((c) => c.ciiu === "C1" && c.tamano === "pequena");
    expect(pequena?.n_empresas).toBe(30);
    expect(celdas.find((c) => c.tamano === "grande")).toBeUndefined();
  });
});

describe("compararConSector con niveles CIIU", () => {
  const traza = {
    fuente_nombre: "x",
    fuente_url: "https://example.com",
    fecha_publicacion: null,
    fecha_consulta: "2026-11-05",
    tipo: "hecho" as const,
    confianza: "media" as const,
    desactualizado: false,
  };
  const bm: Benchmark = {
    ciiu: "C107",
    tamano: "pequena",
    periodo: "2025",
    ratio_id: "razon_corriente",
    p10: 0.8,
    p25: 1,
    mediana: 1.3,
    p75: 1.8,
    p90: 2.4,
    n_empresas: 55,
    traza,
  };
  const ratios = { razon_corriente: 1.5 } as unknown as Ratios;

  it("sube al nivel superior si no hay celda exacta", () => {
    const r = compararConSector(ratios, [bm], { ciiu: "C1071.01", tamano: "pequena" });
    expect(r.disponible).toBe(true);
  });
  it("no disponible si no hay celda en ningún nivel", () => {
    const r = compararConSector(ratios, [bm], { ciiu: "G4711", tamano: "pequena" });
    expect(r.disponible).toBe(false);
  });
});

describe("csv", () => {
  it("lee comillas, comas internas y saltos CRLF", () => {
    const f = parsearCsv('a;b\r\n"x;y";"1""2"\r\n', ";");
    expect(f).toEqual([
      ["a", "b"],
      ["x;y", '1"2'],
    ]);
  });
  it("interpreta formatos numéricos", () => {
    expect(numero("1234.56")).toBe(1234.56);
    expect(numero("1.234,56")).toBe(1234.56);
    expect(numero("1,234.56")).toBe(1234.56);
    expect(numero("12,5")).toBe(12.5);
    expect(numero("")).toBeNull();
    expect(numero("abc")).toBeNull();
    expect(numero(undefined)).toBeNull();
  });
});
