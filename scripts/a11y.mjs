/**
 * Auditoría de accesibilidad automática (axe-core) sobre el HTML compilado.
 * Recorre cada ruta en claro y oscuro, escritorio y móvil, con los plegables abiertos, y también el informe.
 * Uso: npm run build:html && npm run a11y     (sale con error si hay violaciones)
 * Nota: axe detecta una parte de los problemas; no sustituye la prueba con un lector de pantalla real.
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Con A11Y_BASE=http://127.0.0.1:3123 audita el sitio real de Next.js; si no, el HTML de un solo archivo.
const BASE = process.env.A11Y_BASE;
const url = pathToFileURL(resolve("dist/listo-para-credito.html")).href;
const destino = (ruta) => (BASE ? BASE + ruta : url + "#" + ruta);
const RUTAS = ["/", "/personas", "/empresas", "/verificaciones", "/metodologia", "/privacidad", "/terminos", "/comentarios"];
const ETIQUETAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const ENTORNOS = [
  { nombre: "escritorio claro", viewport: { width: 1280, height: 900 }, colorScheme: "light" },
  { nombre: "escritorio oscuro", viewport: { width: 1280, height: 900 }, colorScheme: "dark" },
  { nombre: "móvil claro", viewport: { width: 360, height: 780 }, colorScheme: "light", isMobile: true },
  { nombre: "móvil oscuro", viewport: { width: 360, height: 780 }, colorScheme: "dark", isMobile: true },
];

const navegador = await chromium.launch();
let total = 0;
let revisiones = 0;

async function auditar(pagina, contexto) {
  const r = await new AxeBuilder({ page: pagina }).withTags(ETIQUETAS).analyze();
  revisiones += 1;
  for (const v of r.violations) {
    total += v.nodes.length;
    console.log(`FALLA [${contexto}] ${v.id} (${v.impact}): ${v.help}`);
    for (const n of v.nodes.slice(0, 3)) console.log(`   ${n.target.join(" ")}\n   ${(n.failureSummary ?? "").split("\n").slice(1, 3).join(" | ")}`);
  }
}

for (const entorno of ENTORNOS) {
  const { nombre, ...opciones } = entorno;
  const ctx = await navegador.newContext(opciones);
  const pagina = await ctx.newPage();
  for (const ruta of RUTAS) {
    await pagina.goto(destino(ruta));
    await pagina.locator("main h1, main h2").first().waitFor();
    await pagina.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    await auditar(pagina, `${nombre} ${ruta}`);
  }
  // Informe de persona y de empresa.
  for (const ruta of ["/personas", "/empresas"]) {
    await pagina.goto(destino(ruta));
    await pagina.locator(".informe-boton").waitFor();
    await pagina.locator(".informe-boton").click();
    await pagina.locator(".informe-capa").waitFor();
    await auditar(pagina, `${nombre} informe ${ruta}`);
    await pagina.keyboard.press("Escape");
  }
  await ctx.close();
}
await navegador.close();
console.log(total === 0 ? `\nSin violaciones de accesibilidad (${revisiones} revisiones).` : `\n${total} nodo(s) con violaciones en ${revisiones} revisiones.`);
process.exit(total === 0 ? 0 : 1);
