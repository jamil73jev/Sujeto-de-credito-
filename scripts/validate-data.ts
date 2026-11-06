/**
 * Valida todos los datasets de /data: esquema, ids únicos, trazabilidad y coherencia.
 * Errores => código de salida 1 (rompe CI). Advertencias => se muestran pero no rompen.
 */
import { ZodError } from "zod";

const errores: string[] = [];
const advertencias: string[] = [];

function formatear(e: unknown): string {
  if (e instanceof ZodError) {
    return e.issues.map((i) => `  - ${i.path.join(".") || "(raíz)"}: ${i.message}`).join("\n");
  }
  return `  - ${e instanceof Error ? e.message : String(e)}`;
}

function idsUnicos(nombre: string, ids: string[]) {
  const vistos = new Set<string>();
  for (const id of ids) {
    if (vistos.has(id)) errores.push(`${nombre}: id duplicado "${id}"`);
    vistos.add(id);
  }
}

const DIAS_ANTIGUEDAD_ADVERTENCIA = 60;
const hoy = new Date();

function revisarTraza(nombre: string, id: string, t: { fecha_consulta: string; desactualizado: boolean; confianza: string }) {
  if (t.desactualizado) advertencias.push(`${nombre}/${id}: marcado como desactualizado`);
  const dias = (hoy.getTime() - new Date(t.fecha_consulta).getTime()) / 86_400_000;
  if (dias > DIAS_ANTIGUEDAD_ADVERTENCIA) {
    advertencias.push(`${nombre}/${id}: consultado hace ${Math.round(dias)} días (revisar vigencia)`);
  }
}

async function main() {
  let modulo: typeof import("../src/lib/datos");
  try {
    modulo = await import("../src/lib/datos");
  } catch (e) {
    console.error("Los datasets no cumplen su esquema:\n" + formatear(e));
    process.exit(1);
  }
  const { datos } = modulo;
  const { MUESTRA_MINIMA_BENCHMARK } = await import("../src/lib/parametros");

  // Registros con id + traza
  const colecciones: Array<[string, Array<{ id: string; traza: Parameters<typeof revisarTraza>[2] }>]> = [
    ["fuentes", datos.fuentes.registros],
    ["normativa", datos.normativa.registros],
    ["segmentos_credito", datos.segmentos.registros],
    ["verificaciones_oficiales", datos.verificaciones.registros],
    ["alertas_estafas", datos.alertas.registros],
    ["checklist_personas", datos.checklistPersonas.registros],
    ["checklist_empresas", datos.checklistEmpresas.registros],
    ["indicadores_empresas", datos.indicadores.registros],
    ["bandas_score", datos.bandas.bandas],
    ["requisitos_productos", datos.requisitos.registros],
    ["habitos_score", datos.habitos.registros],
  ];
  for (const [nombre, regs] of colecciones) {
    idsUnicos(nombre, regs.map((r) => r.id));
    for (const r of regs) revisarTraza(nombre, r.id, r.traza);
  }
  idsUnicos("vacios", datos.vacios.registros.map((r) => r.id));
  idsUnicos("riesgos", datos.riesgos.registros.map((r) => r.id));

  // Bandas de score: deben cubrir el rango completo sin huecos ni solapes
  const bandas = [...datos.bandas.bandas].sort((a, b) => a.desde - b.desde);
  let esperado = datos.bandas.rango_min;
  for (const b of bandas) {
    if (b.desde !== esperado) errores.push(`bandas_score: se esperaba una banda desde ${esperado} y empieza en ${b.desde}`);
    if (b.hasta < b.desde) errores.push(`bandas_score: banda "${b.id}" con hasta < desde`);
    esperado = b.hasta + 1;
  }
  if (esperado - 1 !== datos.bandas.rango_max) {
    errores.push(`bandas_score: las bandas terminan en ${esperado - 1} y el rango máximo es ${datos.bandas.rango_max}`);
  }

  // Benchmarks: si el estado es "activo" debe haber registros; si hay registros, deben tener traza
  if (datos.benchmarks.estado === "activo" && datos.benchmarks.registros.length === 0) {
    errores.push("benchmarks_sector: estado 'activo' sin registros");
  }
  for (const b of datos.benchmarks.registros) {
    const etiqueta = `${b.ciiu}/${b.tamano}/${b.periodo}/${b.ratio_id}`;
    if (!(b.p10 <= b.p25 && b.p25 <= b.mediana && b.mediana <= b.p75 && b.p75 <= b.p90)) {
      errores.push(`benchmarks_sector: percentiles desordenados en ${etiqueta}`);
    }
    if (b.n_empresas < MUESTRA_MINIMA_BENCHMARK) {
      errores.push(`benchmarks_sector: ${etiqueta} tiene ${b.n_empresas} empresas (mínimo ${MUESTRA_MINIMA_BENCHMARK})`);
    }
    revisarTraza("benchmarks_sector", etiqueta, b.traza);
  }
  if (datos.benchmarks.estado === "pendiente") {
    advertencias.push("benchmarks_sector: pendiente (la comparación sectorial queda desactivada)");
  }

  // Textos: las preguntas frecuentes no deben repetirse
  idsUnicos("textos.faq", datos.textos.faq.map((f) => f.pregunta));

  // Resumen
  console.log(`Datasets validados. Vacíos de información documentados: ${datos.vacios.registros.length}.`);
  if (advertencias.length > 0) {
    console.warn(`\nAdvertencias (${advertencias.length}):`);
    for (const a of advertencias) console.warn(`  ! ${a}`);
  }
  if (errores.length > 0) {
    console.error(`\nErrores (${errores.length}):`);
    for (const e of errores) console.error(`  x ${e}`);
    process.exit(1);
  }
  console.log("\nOK");
}

main().catch((e) => {
  console.error(formatear(e));
  process.exit(1);
});
