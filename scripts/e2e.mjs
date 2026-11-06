/**
 * Prueba de extremo a extremo sobre el HTML de un solo archivo (dist/sujeto-credito-ec.html).
 * Comprueba el flujo principal y que el sitio no hace ninguna petición de red.
 * Uso: npm run build:html && npm run e2e
 */
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Por defecto prueba el HTML de un solo archivo; con E2E_BASE=http://127.0.0.1:3123 prueba el sitio real de Next.js.
const BASE = process.env.E2E_BASE;
const url = pathToFileURL(resolve("dist/sujeto-credito-ec.html")).href;
const destino = (ruta) => (BASE ? BASE + ruta : url + "#" + ruta);
const fallos = [];
const comprobar = (ok, mensaje) => {
  console.log(`${ok ? "OK " : "FALLA"} ${mensaje}`);
  if (!ok) fallos.push(mensaje);
};

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
const errores = [];
const peticiones = [];
pagina.on("pageerror", (e) => errores.push(e.message));
pagina.on("console", (m) => m.type() === "error" && errores.push(m.text()));
pagina.on("request", (r) => {
  const u = r.url();
  if (!u.startsWith("file:") && !u.startsWith("data:") && !u.startsWith("blob:") && !(BASE && u.startsWith(BASE))) peticiones.push(`${r.method()} ${u}`);
});

// Portada: el simulador responde a los datos.
await pagina.goto(destino("/"));
const veredicto = pagina.locator(".simulador .veredicto");
await veredicto.waitFor();
comprobar((await veredicto.textContent()) === "Preliminar: favorable", "Portada: el simulador arranca en «Preliminar: favorable» con los valores de ejemplo");
await pagina.fill("#sim-nueva", "900");
comprobar((await veredicto.textContent()) !== "Preliminar: favorable", "Portada: una cuota nueva muy alta cambia el resultado");

// Personas: indicadores con fórmula y resultado en vivo.
await pagina.goto(destino("/personas"));
await pagina.locator(".vivo .kpi").first().waitFor();
comprobar((await pagina.locator(".vivo .kpi .formula").count()) >= 2, "Personas: los indicadores muestran su fórmula");
await pagina.fill("#ingresoMensual", "300");
comprobar((await pagina.locator(".vivo .veredicto").textContent()) === "Débil", "Personas: ingreso bajo da «Débil»");

// Empresas: indicadores con fórmula.
await pagina.goto(destino("/empresas"));
await pagina.locator(".vivo .kpi").first().waitFor();
comprobar((await pagina.locator(".vivo .kpi").count()) >= 3, "Empresas: se muestran los indicadores clave");

const abrirDetalle = async () => {
  const b = pagina.locator(".vivo .detalle-boton");
  if ((await b.isVisible()) && (await b.getAttribute("aria-expanded")) === "false") await b.click();
};

// Fase 1: escenarios, año anterior y tabla de reglas.
await pagina.goto(destino("/personas"));
await abrirDetalle();
comprobar((await pagina.locator(".vivo .escenario").count()) === 3, "Personas: se muestran los tres escenarios");
comprobar(((await pagina.locator(".vivo .pie-panel").textContent()) ?? "").includes("Metodología v1.1"), "Panel: muestra la versión de la metodología");

await pagina.goto(destino("/empresas"));
await abrirDetalle();
comprobar((await pagina.locator(".vivo .escenario").count()) === 3, "Empresas: se muestran los tres escenarios de flujo y deuda");
const kpisAntes = await pagina.locator(".vivo .kpi").count();
await pagina.locator("summary", { hasText: "Año anterior" }).click();
await pagina.fill("#antVentas", "400000");
await pagina.fill("#antUtilidad", "20000");
await pagina.fill("#antActivo", "240000");
await pagina.fill("#antPatrimonio", "100000");
comprobar((await pagina.locator(".vivo .kpi").count()) === kpisAntes + 1, "Empresas: el año anterior agrega el crecimiento de ventas (20,0 %)");
comprobar(((await pagina.locator(".vivo .kpi", { hasText: "Crecimiento de ventas" }).textContent()) ?? "").includes("20"), "Empresas: crecimiento de ventas correcto");
await pagina.fill("#antPatrimonio", "");
comprobar(((await pagina.locator(".vivo .frase").textContent()) ?? "").includes("año anterior"), "Empresas: año anterior incompleto pide completar o vaciar");

await pagina.goto(destino("/metodologia"));
await pagina.locator("summary", { hasText: "Reglas y umbrales" }).click();
comprobar((await pagina.locator("#reglas table tbody tr").count()) >= 15, "Metodología: la tabla de reglas lista los umbrales");

// Fase 2: informe imprimible.
await pagina.goto(destino("/personas"));
await pagina.evaluate(() => {
  window.__imprimio = 0;
  window.print = () => { window.__imprimio += 1; };
});
await pagina.locator(".informe-boton").click();
const capa = pagina.locator(".informe-capa");
await capa.waitFor();
const folio = ((await capa.locator(".informe-meta dd").first().textContent()) ?? "").trim();
comprobar(/^P-\d{8}-[0-9A-F]{6}$/.test(folio), `Informe: folio con formato correcto (${folio})`);
comprobar(((await capa.textContent()) ?? "").includes("Metodología v1.1") || ((await capa.locator(".informe-meta").textContent()) ?? "").includes("v1.1"), "Informe: muestra la versión de la metodología");
comprobar((await capa.locator("h2").count()) >= 7, "Informe: tiene las secciones (resultado, dimensiones, escenarios, recomendaciones, documentos, datos, fichas, umbrales)");
comprobar((await capa.locator(".informe-ficha").count()) >= 3, "Informe: incluye fichas técnicas");
comprobar(((await capa.locator(".informe-meta").textContent()) ?? "").includes("Nombre") === false, "Informe: sin nombre hasta que la persona lo escribe");
await pagina.fill("#informe-nombre", "María Pérez");
comprobar(((await capa.locator(".informe-meta").textContent()) ?? "").includes("María Pérez"), "Informe: el nombre opcional aparece en el informe");
comprobar(((await pagina.evaluate(() => document.activeElement?.id)) ?? "") === "informe-nombre", "Informe: el foco queda en el campo que se está usando");
await capa.getByRole("button", { name: /Imprimir/ }).click();
comprobar((await pagina.evaluate(() => window.__imprimio)) === 1, "Informe: el botón llama a la impresión del navegador");
// Al imprimir solo debe verse el informe (no la cabecera, el formulario ni la barra de acciones).
await pagina.emulateMedia({ media: "print" });
comprobar(!(await pagina.locator(".cabecera").isVisible()), "Informe: al imprimir se oculta la cabecera del sitio");
comprobar(!(await pagina.locator(".informe-barra").isVisible()), "Informe: al imprimir se oculta la barra de acciones");
comprobar(await pagina.locator(".informe").isVisible(), "Informe: al imprimir se ve el informe");
const pdf = await pagina.pdf({ format: "A4", preferCSSPageSize: true });
comprobar(pdf.length > 20000, `Informe: se genera el PDF (${Math.round(pdf.length / 1024)} KB)`);
await pagina.emulateMedia({ media: "screen" });
// Teclado: Tab no sale de la capa y Escape la cierra devolviendo el foco al botón.
for (let i = 0; i < 6; i++) await pagina.keyboard.press("Tab");
comprobar(await pagina.evaluate(() => !!document.activeElement?.closest(".informe-capa")), "Informe: el foco no se escapa de la capa con Tab");
await pagina.keyboard.press("Escape");
comprobar((await pagina.locator(".informe-capa").count()) === 0, "Informe: Escape lo cierra");
comprobar(await pagina.evaluate(() => document.activeElement?.classList.contains("informe-boton") ?? false), "Informe: al cerrar, el foco vuelve al botón");
comprobar(await pagina.evaluate(() => !document.body.classList.contains("con-informe")), "Informe: al cerrar se restablece la página");

await pagina.goto(destino("/empresas"));
await pagina.locator(".informe-boton").click();
comprobar(/^E-\d{8}-[0-9A-F]{6}$/.test(((await pagina.locator(".informe-capa .informe-meta dd").first().textContent()) ?? "").trim()), "Informe de empresa: folio con prefijo E");
await pagina.keyboard.press("Escape");

// El informe no debe desbordar horizontalmente en un teléfono.
await pagina.setViewportSize({ width: 360, height: 800 });
await pagina.goto(destino("/empresas"));
await pagina.locator(".informe-boton").click();
comprobar(await pagina.evaluate(() => { const c = document.querySelector(".informe-capa"); return c.scrollWidth <= c.clientWidth; }), "Informe: sin desbordamiento horizontal a 360 px");
await pagina.keyboard.press("Escape");
await pagina.setViewportSize({ width: 1280, height: 900 });

// Teclado: el enlace «Saltar al contenido» es el primer foco y lleva al contenido; todo se alcanza con Tab y el foco se ve.
await pagina.goto(destino("/personas"));
await pagina.reload(); // foco y punto de partida del teclado limpios
await pagina.locator(".vivo .kpi").first().waitFor();
await pagina.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
await pagina.keyboard.press("Tab");
comprobar(await pagina.evaluate(() => document.activeElement?.classList.contains("saltar") ?? false), "Teclado: el primer foco es «Saltar al contenido»");
const contorno = await pagina.evaluate(() => { const e = document.activeElement; const c = e ? getComputedStyle(e) : null; return c ? `${c.outlineStyle}|${parseFloat(c.outlineWidth)}` : ""; });
comprobar(!contorno.startsWith("none") && parseFloat(contorno.split("|")[1]) >= 2, `Teclado: el foco tiene contorno visible (${contorno})`);
await pagina.keyboard.press("Enter");
comprobar(await pagina.evaluate(() => document.activeElement?.id === "contenido"), "Teclado: «Saltar al contenido» mueve el foco al contenido");
let llegoAlInforme = false;
for (let i = 0; i < 80 && !llegoAlInforme; i++) {
  await pagina.keyboard.press("Tab");
  llegoAlInforme = await pagina.evaluate(() => document.activeElement?.classList.contains("informe-boton") ?? false);
}
comprobar(llegoAlInforme, "Teclado: «Generar informe» se alcanza solo con Tab");
await pagina.keyboard.press("Enter");
comprobar((await pagina.locator(".informe-capa").count()) === 1, "Teclado: Enter abre el informe");
await pagina.keyboard.press("Escape");

// Comentarios: sin servidor; avisa si el texto parece traer datos personales y prepara un correo.
await pagina.goto(destino("/comentarios"));
await pagina.locator("#c-confuso").waitFor();
await pagina.selectOption("#c-quien", "empresa");
await pagina.fill("#c-confuso", "No entendí la escala");
const enlaceCorreo = pagina.getByRole("link", { name: /Abrir mi correo/ });
const href = (await enlaceCorreo.getAttribute("href")) ?? "";
comprobar(href.startsWith("mailto:") && decodeURIComponent(href).includes("No entendí la escala") && decodeURIComponent(href).includes("Empresa"), "Comentarios: prepara un correo con lo escrito");
comprobar(!decodeURIComponent(href).includes("ingresoMensual"), "Comentarios: el mensaje no incluye datos del diagnóstico");
await pagina.fill("#c-mejorar", "Llámenme al 0987654321");
comprobar(((await pagina.locator("[role=alert]").first().textContent()) ?? "").includes("Bórralo"), "Comentarios: avisa si el texto parece traer un teléfono, cédula, RUC o correo");
comprobar((await enlaceCorreo.getAttribute("aria-disabled")) === "true", "Comentarios: bloquea el envío mientras haya datos personales");
await pagina.fill("#c-mejorar", "");

// Cabeceras de seguridad (solo en el sitio real, que las sirve Next).
if (BASE) {
  const r = await pagina.request.get(BASE + "/personas");
  const h = r.headers();
  comprobar((h["content-security-policy"] ?? "").includes("default-src 'self'") && !/https?:\/\//.test(h["content-security-policy"] ?? ""), "Cabeceras: CSP estricta sin orígenes externos");
  comprobar(h["x-frame-options"] === "DENY" && h["x-content-type-options"] === "nosniff", "Cabeceras: sin incrustación ni sniffing");
  comprobar(/^max-age=\d+$/.test(h["strict-transport-security"] ?? ""), "Cabeceras: HSTS sin preload ni subdominios");
  comprobar(h["x-powered-by"] === undefined, "Cabeceras: no revela la tecnología (x-powered-by)");
  const robots = await (await pagina.request.get(BASE + "/robots.txt")).text();
  comprobar(robots.includes("Allow: /") || robots.includes("Disallow: /"), "robots.txt responde");
}

// Privacidad: nada sale del navegador y no hay errores.
comprobar(peticiones.length === 0, `Sin peticiones de red (encontradas: ${peticiones.length}${peticiones.length ? " → " + peticiones.join(", ") : ""})`);
comprobar(errores.length === 0, `Sin errores en consola (encontrados: ${errores.length}${errores.length ? " → " + errores.join(" | ") : ""})`);

await navegador.close();
if (fallos.length) {
  console.error(`\n${fallos.length} comprobación(es) fallaron.`);
  process.exit(1);
}
console.log("\nTodas las comprobaciones pasaron.");
