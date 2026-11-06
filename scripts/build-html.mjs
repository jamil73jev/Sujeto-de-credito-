/**
 * Genera un único archivo HTML autocontenido (sin servidor) para probar el sitio.
 * Uso: npm run build:html [ruta-de-salida]   (requiere esbuild: npm i -D esbuild)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const salida = resolve(process.argv[2] ?? resolve(raiz, "dist/listo-para-credito.html"));

const shims = {
  "next/link": resolve(raiz, "scripts/html/shim-link.tsx"),
};

const resultado = await build({
  entryPoints: [resolve(raiz, "scripts/html/main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  tsconfig: resolve(raiz, "tsconfig.json"),
  banner: { js: 'var process={cwd:function(){return "/"},env:{}};' },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SITE_URL": '"http://localhost"',
  },
  plugins: [
    {
      name: "shims",
      setup(b) {
        b.onResolve({ filter: /^next\/link$/ }, (args) => ({ path: shims[args.path] }));
      },
    },
  ],
  logLevel: "warning",
});

const js = resultado.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = readFileSync(resolve(raiz, "src/app/globals.css"), "utf8");

const html = `<!doctype html>
<html lang="es-EC">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Listo para Crédito</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, html);
console.log(`HTML generado: ${salida} (${(html.length / 1024).toFixed(0)} KB)`);
