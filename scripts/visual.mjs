/**
 * Pruebas visuales: compara capturas del HTML compilado con las de referencia en tests/visual/.
 * Uso: npm run build:html && npm run visual            (compara)
 *      npm run build:html && npm run visual -- --update   (regenera las de referencia)
 * Las capturas dependen de las fuentes del sistema: genera las de referencia en el mismo entorno que las comparará (CI).
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const url = pathToFileURL(resolve("dist/sujeto-credito-ec.html")).href;
const actualizar = process.argv.includes("--update");
const CARPETA = resolve("tests/visual");
const TOLERANCIA_PIXELES = 0.01; // 1 % de píxeles distintos
mkdirSync(CARPETA, { recursive: true });
mkdirSync(resolve("tests/visual/_diferencias"), { recursive: true });

const VISTAS = [
  { id: "inicio-escritorio", ruta: "/", viewport: { width: 1280, height: 900 } },
  { id: "inicio-movil", ruta: "/", viewport: { width: 390, height: 844 }, isMobile: true },
  { id: "personas-escritorio", ruta: "/personas", viewport: { width: 1280, height: 900 } },
  { id: "empresas-escritorio", ruta: "/empresas", viewport: { width: 1280, height: 900 } },
  { id: "metodologia-escritorio", ruta: "/metodologia", viewport: { width: 1280, height: 900 } },
  { id: "inicio-oscuro", ruta: "/", viewport: { width: 1280, height: 900 }, colorScheme: "dark" },
  { id: "informe-persona", ruta: "/personas", viewport: { width: 1280, height: 900 }, informe: true },
];

const navegador = await chromium.launch();
let fallos = 0;
for (const { id, ruta, informe, ...opciones } of VISTAS) {
  const ctx = await navegador.newContext({ ...opciones, reducedMotion: "reduce" });
  const pagina = await ctx.newPage();
  await pagina.goto(`${url}#${ruta}`);
  await pagina.locator("main h1").first().waitFor();
  if (informe) {
    await pagina.locator(".informe-boton").click();
    await pagina.fill("#informe-nombre", "Persona de ejemplo");
  }
  await pagina.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  const actual = await pagina.screenshot({ fullPage: !informe });
  await ctx.close();

  const archivo = resolve(CARPETA, `${id}.png`);
  if (actualizar || !existsSync(archivo)) {
    writeFileSync(archivo, actual);
    console.log(`${actualizar ? "ACTUALIZADA" : "CREADA     "} ${id}`);
    continue;
  }
  const a = PNG.sync.read(readFileSync(archivo));
  const b = PNG.sync.read(actual);
  if (a.width !== b.width || a.height !== b.height) {
    fallos += 1;
    writeFileSync(resolve(CARPETA, "_diferencias", `${id}.png`), actual);
    console.log(`FALLA ${id}: cambió el tamaño (${a.width}×${a.height} → ${b.width}×${b.height})`);
    continue;
  }
  const dif = new PNG({ width: a.width, height: a.height });
  const distintos = pixelmatch(a.data, b.data, dif.data, a.width, a.height, { threshold: 0.15 });
  const proporcion = distintos / (a.width * a.height);
  const ok = proporcion <= TOLERANCIA_PIXELES;
  if (!ok) {
    fallos += 1;
    writeFileSync(resolve(CARPETA, "_diferencias", `${id}.png`), PNG.sync.write(dif));
  }
  console.log(`${ok ? "OK   " : "FALLA"} ${id}: ${(proporcion * 100).toFixed(2)} % de píxeles distintos`);
}
await navegador.close();
process.exit(fallos ? 1 : 0);
