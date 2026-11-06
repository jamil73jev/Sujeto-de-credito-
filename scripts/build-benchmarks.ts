/**
 * Calcula data/benchmarks_sector.json a partir de un CSV descargado por ti de la Superintendencia de Compañías.
 *
 * Uso:
 *   npx tsx scripts/build-benchmarks.ts <archivo.csv> --fuente-url <URL del conjunto de datos> [--config scripts/benchmarks.config.json]
 *        [--fecha-publicacion AAAA-MM-DD] [--activar]
 *
 * - No descarga nada: tú bajas el CSV y confirmas sus condiciones de reutilización.
 * - Los nombres de columna salen de scripts/benchmarks.config.json y deben coincidir con los del archivo.
 * - Una celda CIIU × tamaño × año solo se publica con al menos MUESTRA_MINIMA_BENCHMARK empresas válidas.
 * - El estado queda "pendiente" salvo que pases --activar (hazlo solo con la licencia confirmada).
 * - Las filas con datos faltantes o no numéricos se descartan del ratio afectado; se informa cuántas.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { numero, parsearCsv } from "../src/lib/csv";
import { calcularBenchmarks, type FilaEmpresa, type Tamano } from "../src/lib/benchmarks";
import { calcularRatios, type EntradaEmpresa } from "../src/lib/empresas";
import { MUESTRA_MINIMA_BENCHMARK } from "../src/lib/parametros";
import { benchmarksSchema } from "../src/lib/schemas";

interface Config {
  separador: "auto" | "," | ";" | "\t";
  codificacion: "utf8" | "latin1";
  escala: number;
  columnas: Record<string, string>;
  tamanos: Record<string, Tamano>;
}

/** RATIOS que se publican: los que tienen una definición estable con solo el balance y el estado de resultados. */
const RATIOS_PUBLICADOS = [
  "razon_corriente",
  "prueba_acida",
  "endeudamiento",
  "apalancamiento",
  "margen_neto",
  "roa",
  "roe",
  "cobertura_intereses",
  "rotacion_activos",
  "dias_cobranza",
] as const;

function fallar(mensaje: string): never {
  console.error(`Error: ${mensaje}`);
  process.exit(1);
}

function argumento(nombre: string): string | undefined {
  const i = process.argv.indexOf(nombre);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function detectarSeparador(primeraLinea: string): string {
  const cuentas = [",", ";", "\t"].map((s) => [s, primeraLinea.split(s).length] as const);
  return cuentas.sort((a, b) => b[1] - a[1])[0]![0];
}

function main() {
  const archivo = process.argv[2];
  if (!archivo || archivo.startsWith("--")) fallar("indica el CSV: npx tsx scripts/build-benchmarks.ts <archivo.csv> --fuente-url <URL>");
  const fuenteUrl = argumento("--fuente-url");
  if (!fuenteUrl) fallar("falta --fuente-url (la página de donde descargaste el CSV); es obligatoria para la trazabilidad.");
  const fechaPublicacion = argumento("--fecha-publicacion") ?? null;
  const rutaConfig = argumento("--config") ?? "scripts/benchmarks.config.json";
  const cfg = JSON.parse(readFileSync(resolve(rutaConfig), "utf8")) as Config;

  const texto = readFileSync(resolve(archivo as string), cfg.codificacion).replace(/^﻿/, "");
  const sep = cfg.separador === "auto" ? detectarSeparador(texto.split(/\r?\n/, 1)[0] ?? "") : cfg.separador;
  const filas = parsearCsv(texto, sep);
  const encabezado = (filas.shift() ?? []).map((h) => h.trim());
  if (filas.length === 0) fallar("el CSV no tiene filas de datos.");

  const idx: Record<string, number> = {};
  const faltan: string[] = [];
  for (const [clave, nombre] of Object.entries(cfg.columnas)) {
    const i = encabezado.findIndex((h) => h.toLowerCase() === nombre.toLowerCase());
    if (i < 0) faltan.push(`${clave} → "${nombre}"`);
    else idx[clave] = i;
  }
  const obligatorias = ["ciiu", "tamano", "periodo", "ventas", "activo_corriente", "pasivo_corriente", "activo_total", "pasivo_total", "patrimonio", "utilidad_neta"];
  const sinObligatorias = obligatorias.filter((c) => idx[c] === undefined);
  if (sinObligatorias.length > 0) {
    fallar(
      `columnas obligatorias que no existen en el CSV: ${sinObligatorias.join(", ")}.\nEncabezados encontrados: ${encabezado.join(" | ")}\nAjusta "columnas" en ${rutaConfig}.`,
    );
  }
  if (faltan.length > 0) console.warn(`Aviso: columnas opcionales ausentes (sus ratios no se calcularán): ${faltan.join("; ")}`);

  const celda = (f: string[], clave: string) => (idx[clave] === undefined ? undefined : f[idx[clave] as number]);
  const valor = (f: string[], clave: string) => {
    const n = numero(celda(f, clave));
    return n === null ? null : n * cfg.escala;
  };

  const descartes = { sinCiiuOTamano: 0, sinBalanceBasico: 0 };
  const empresas: FilaEmpresa[] = [];
  for (const f of filas) {
    const ciiu = (celda(f, "ciiu") ?? "").trim();
    const tamano = cfg.tamanos[(celda(f, "tamano") ?? "").trim().toUpperCase()];
    const periodo = (celda(f, "periodo") ?? "").trim().slice(0, 4);
    if (!ciiu || !tamano || !/^\d{4}$/.test(periodo)) {
      descartes.sinCiiuOTamano++;
      continue;
    }
    const v = {
      ventas: valor(f, "ventas"),
      ac: valor(f, "activo_corriente"),
      pc: valor(f, "pasivo_corriente"),
      at: valor(f, "activo_total"),
      pt: valor(f, "pasivo_total"),
      pat: valor(f, "patrimonio"),
      un: valor(f, "utilidad_neta"),
    };
    if (Object.values(v).some((x) => x === null)) {
      descartes.sinBalanceBasico++;
      continue;
    }
    const entrada: EntradaEmpresa = {
      ventasAnuales: v.ventas as number,
      activoCorriente: v.ac as number,
      pasivoCorriente: v.pc as number,
      inventarios: valor(f, "inventarios"),
      activoTotal: v.at as number,
      pasivoTotal: v.pt as number,
      patrimonio: v.pat as number,
      utilidadNeta: v.un as number,
      utilidadOperativa: valor(f, "utilidad_operativa"),
      gastosFinancieros: valor(f, "gastos_financieros"),
      cuentasPorCobrar: valor(f, "cuentas_por_cobrar"),
      flujoDisponible: null,
      servicioDeuda: null,
      aniosRuc: 0,
      cumplimientoTributario: "no_se",
      obligacionesPatronales: "no_se",
      estadosFinancierosPresentados: "no_se",
    };
    const ratios = calcularRatios(entrada);
    empresas.push({ ciiu, tamano, periodo, ratios: Object.fromEntries(RATIOS_PUBLICADOS.map((r) => [r, ratios[r]])) });
  }

  const registros = calcularBenchmarks(empresas);
  const hoy = new Date().toISOString().slice(0, 10);
  const traza = {
    fuente_nombre: "Superintendencia de Compañías, Valores y Seguros: balances de compañías (cálculo propio de percentiles)",
    fuente_url: fuenteUrl as string,
    fecha_publicacion: fechaPublicacion,
    fecha_consulta: hoy,
    tipo: "hecho" as const,
    confianza: "media" as const,
    desactualizado: false,
  };
  const activar = process.argv.includes("--activar");
  const salida = benchmarksSchema.parse({
    version: 3,
    estado: activar && registros.length > 0 ? "activo" : "pendiente",
    nota: activar
      ? `Percentiles calculados con ${empresas.length} empresas del CSV indicado; solo celdas con al menos ${MUESTRA_MINIMA_BENCHMARK} empresas. Si tu CIIU exacto no tiene celda se usa el nivel superior.`
      : "Calculados pero sin activar: falta confirmar las condiciones de reutilización de la fuente. Ejecuta de nuevo con --activar cuando estén confirmadas.",
    registros: registros.map((r) => ({ ...r, traza })),
  });
  writeFileSync(resolve("data/benchmarks_sector.json"), JSON.stringify(salida, null, 2) + "\n");

  console.log(`Filas leídas: ${filas.length}. Empresas usadas: ${empresas.length}.`);
  console.log(`Descartadas: sin CIIU/tamaño/año reconocible ${descartes.sinCiiuOTamano}; sin balance básico ${descartes.sinBalanceBasico}.`);
  console.log(`Celdas publicadas (n >= ${MUESTRA_MINIMA_BENCHMARK}): ${registros.length}. Estado: ${salida.estado}.`);
}

main();
