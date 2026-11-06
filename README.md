# ¿Soy sujeto de crédito? Ecuador

Sitio público y gratuito para que personas y empresas de Ecuador se **autoevalúen** como sujetos de crédito, con estimaciones orientativas y enlaces a las verificaciones oficiales. El alcance es **solo elegibilidad de crédito**: no incluye simulador ni panel de mercado. La interfaz calcula en vivo (sin botón): los formularios arrancan con valores de ejemplo rotulados como tales, y el texto largo vive en paneles plegables.

## Plan y diseño

- [`docs/plan-de-profesionalizacion.md`](docs/plan-de-profesionalizacion.md): plan por fases (0 a 5), alcance y línea roja, brechas frente a nivel buró, hitos, métricas y riesgos.
- [`diseno/esqueleto/`](diseno/esqueleto/): fuentes del esqueleto de diseño pantalla por pantalla.
- [`prototipos/`](prototipos/): versiones HTML de un solo archivo para revisar sin instalar nada.

## Principios de diseño

- **Sin datos de terceros.** El Registro de Datos Crediticios (COMF art. 357) solo se entrega al titular o a quien él autorice. El sitio no consulta burós, SRI ni superintendencias: enlaza a sus canales oficiales.
- **Sin almacenamiento.** Todo se calcula en el navegador. No hay base de datos, cuentas, cookies de seguimiento ni analítica.
- **Orientativo, nunca una aprobación.** Resultados: favorable / condicionado / débil / insuficiente, siempre con descargo.
- **Datos con trazabilidad.** Cada dato en `data/` lleva fuente, URL, fechas, tipo (hecho / interpretación / recomendación) y confianza. Lo que no se pudo confirmar queda `null` y documentado en `data/vacios.json`; no se inventa.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # ajusta NEXT_PUBLIC_SITE_URL y NEXT_PUBLIC_CONTACT_EMAIL
npm run dev                  # http://localhost:3000
```

Comprobaciones (las mismas que corre CI): `npm run check` (tipos + pruebas + validación de datasets) y `npm run build`.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `data/` | Datasets JSON/CSV (fuente de verdad de textos, normativa, tasas, verificaciones, etc.) |
| `src/lib/schemas.ts` | Esquemas zod de cada dataset |
| `src/lib/datos.ts` | Carga y valida los datasets; el build falla si alguno es inválido |
| `src/lib/parametros.ts` | **Parámetros referenciales editables** (umbrales de las estimaciones) |
| `src/components/PanelVivo.tsx` | Panel que se recalcula al editar: veredicto, escala, radar por dimensión y detalle plegable |
| `src/lib/panel.ts` | Resumen por dimensión para el radar (no es un puntaje) |
| `src/lib/personas.ts`, `empresas.ts`, `cuota.ts` (calculadora de cuota dentro del formulario de personas), `benchmarks.ts`, `csv.ts` | Lógica pura, sin dependencias de UI, con pruebas |
| `src/app/` | Páginas: inicio, personas, empresas (elegibilidad), verificaciones oficiales y alertas, metodología, privacidad, términos, `/api/health` |
| `scripts/validate-data.ts` | Validación: esquemas, ids únicos, bandas de score, benchmarks (n ≥ 30, percentiles ordenados), vigencia |
| `scripts/build-benchmarks.ts` | Calcula `data/benchmarks_sector.json` desde un CSV que tú descargas (ver abajo) |
| `scripts/build-html.mjs` | Genera `dist/sujeto-credito-ec.html`, versión de un solo archivo para probar (`npm i -D esbuild`, luego `npm run build:html`) |
| `tests/` | Pruebas con vitest |

## Despliegue (Vercel)

Guía completa, con la beta y el lanzamiento, en `docs/despliegue.md`; lista de control en `docs/lista-verificacion-lanzamiento.md`.

1. Sube el proyecto a un repositorio de GitHub e impórtalo en Vercel (detecta Next.js solo).
2. Define `NEXT_PUBLIC_SITE_URL` con tu dominio (por ejemplo `https://tu-dominio.ec`).
3. No requiere secretos ni base de datos. Monitoreo: `GET /api/health`.

Las cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.) están en `next.config.mjs`. Si agregas analítica, tipografías o scripts externos, actualiza la CSP **y** `/privacidad` antes de activarlos.

## Actualizar datos

1. Edita el JSON/CSV correspondiente en `data/` con fuente y fecha reales.
2. `npm run validate:data` (avisa de datos desactualizados o con más de 60 días).
3. Commit: CI valida y Vercel despliega.

## Benchmarks sectoriales

La comparación con el sector está **desactivada** hasta tener datos reales. Para activarla:

1. Descarga tú el CSV de balances de la Superintendencia de Compañías y **confirma sus condiciones de reutilización** (no encontré una licencia explícita).
2. Ajusta los nombres de columna en `scripts/benchmarks.config.json`: son supuestos, porque no pude abrir los archivos reales. Si una columna obligatoria no existe, el script falla y muestra los encabezados encontrados.
3. `npx tsx scripts/build-benchmarks.ts archivo.csv --fuente-url <página de descarga>` calcula p10, p25, mediana, p75 y p90 por CIIU × tamaño × año. Solo publica celdas con al menos 30 empresas; si tu CIIU exacto no alcanza, la comparación sube al nivel superior.
4. Revisa `data/benchmarks_sector.json` y, con la licencia confirmada, repite el comando con `--activar`.
5. `npm run validate:data`.

## Pendiente antes de lanzar

Detalle completo en `data/vacios.json` y en la página `/metodologia`. Lo más importante:

- **Comparación sectorial desactivada** hasta cumplir los pasos de la sección anterior (datos reales y licencia confirmada).
- **La tasa referencial de consumo (BCE, noviembre de 2026) y la alerta de la SEPS vienen de la investigación aportada**, con confianza media; no pude abrir el BCE ni la Superintendencia de Compañías desde el entorno de desarrollo. Contrastar con la publicación oficial.
- **Resolución JPRFM-2026-033-F** verificada con el PDF alojado por Asobanca y prensa; confirmar el número del Registro Oficial en el texto oficial.
- **Equifax Mis Créditos:** la página no se pudo leer (sin navegador); el precio (desde USD 9,61 más IVA) y el de RedClic (USD 10 más IVA) salen del informe. Verificar antes de publicar.
- **Aval Buró:** hay dos URL candidatas (`avalburo.com/ciudadanos` y `avalburo.tusfinanzas.ec/credito`); confirmar cuál es la oficial. También confirmar con la Superintendencia de Bancos qué burós tienen autorización vigente.
- **Umbral cuota/ingreso (30 %)** y la prueba de estrés (caída de 20 %) son supuestos propios, marcados así en el sitio.
- **Correo de contacto:** define `NEXT_PUBLIC_CONTACT_EMAIL`; se muestra en privacidad y términos.
- **Revisión jurídica** (LOPDP y términos del sitio) antes de publicar, y antes de añadir cualquier recolección de datos.
- Dominio propio y revisión de accesibilidad con lector de pantalla.
