/**
 * Lighthouse sobre el HTML compilado, servido en local. Falla si accesibilidad o rendimiento bajan de 95.
 * Uso:
 *   Sitio real (Next.js):  npm run build && (npx next start -p 3123 &) && LIGHTHOUSE_BASE=http://127.0.0.1:3123 npm run lighthouse
 *   HTML de un solo archivo (archivo de prueba, todo se pinta con JavaScript): npm run build:html && npm run lighthouse
 * Requiere un Chromium (usa el de Playwright o la variable CHROME_PATH).
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const UMBRAL = 95;
// La puntuación de rendimiento varía entre corridas (CPU del equipo o del runner); se usa la mediana de varias mediciones.
const CORRIDAS = Math.max(1, Number(process.env.LIGHTHOUSE_RUNS ?? 3));
const RUTAS = ["/", "/personas", "/empresas", "/metodologia"];
const BASE = process.env.LIGHTHOUSE_BASE;
let servidor = null;
let urlDe = (ruta) => `${BASE}${ruta}`;
if (!BASE) {
  const html = readFileSync(resolve("dist/listo-para-credito.html"));
  servidor = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
  const puerto = servidor.address().port;
  urlDe = (ruta) => `http://127.0.0.1:${puerto}/#${ruta}`;
}

const chrome = await launch({
  chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

let fallos = 0;
for (const modo of ["mobile", "desktop"]) {
  for (const ruta of RUTAS) {
    const opciones = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] };
    const config = modo === "desktop" ? { extends: "lighthouse:default", settings: { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } } : undefined;
    const mediciones = [];
    for (let i = 0; i < CORRIDAS; i += 1) mediciones.push(await lighthouse(urlDe(ruta), opciones, config));
    mediciones.sort((a, b) => (a.lhr.categories.performance?.score ?? 0) - (b.lhr.categories.performance?.score ?? 0));
    const r = mediciones[Math.floor(mediciones.length / 2)];
    const c = r.lhr.categories;
    const puntaje = (k) => Math.round((c[k]?.score ?? 0) * 100);
    const fila = { rendimiento: puntaje("performance"), accesibilidad: puntaje("accessibility"), buenasPracticas: puntaje("best-practices"), seo: puntaje("seo") };
    const ok = fila.rendimiento >= UMBRAL && fila.accesibilidad >= UMBRAL;
    if (!ok) fallos += 1;
    console.log(`${ok ? "OK " : "FALLA"} ${modo.padEnd(7)} ${ruta.padEnd(12)} rendimiento ${fila.rendimiento} · accesibilidad ${fila.accesibilidad} · buenas prácticas ${fila.buenasPracticas} · SEO ${fila.seo}`);
    if (!ok) {
      for (const a of Object.values(r.lhr.audits).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== "informative" && x.scoreDisplayMode !== "notApplicable").slice(0, 6)) console.log(`     · ${a.id}: ${a.title}${a.displayValue ? ` (${a.displayValue})` : ""}`);
    }
  }
}
await chrome.kill();
servidor?.close();
process.exit(fallos ? 1 : 0);
