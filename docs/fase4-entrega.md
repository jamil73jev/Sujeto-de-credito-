# Fase 4 · Experiencia y confianza · paquete para aprobación

## Resultados medidos (sitio real de Next.js, `next start`)
| Medida | Resultado | Meta |
|---|---|---|
| Lighthouse accesibilidad (4 rutas × móvil y escritorio) | **100** en las 8 mediciones | ≥ 95 |
| Lighthouse rendimiento | **98 a 100** | ≥ 95 |
| Lighthouse buenas prácticas / SEO | 96–100 / 100 | informativo |
| axe-core (WCAG 2.0, 2.1 y 2.2 A y AA + buenas prácticas) | **0 violaciones** en 36 revisiones: 7 rutas + informes de persona y empresa × escritorio y móvil × claro y oscuro, con plegables abiertos | 0 |
| Consola | sin errores (tampoco de CSP) | 0 |
| Peticiones de red durante todo el recorrido | **0** hacia terceros | 0 |

El HTML de un solo archivo (solo para pruebas) saca 66 en rendimiento móvil porque pinta todo con JavaScript; no es el sitio que se publica.

## Qué se corrigió a partir de la auditoría
- El enlace «Saltar al contenido» apuntaba a un destino inexistente en la versión de prueba y el contenido principal no podía recibir foco.
- Las tablas con desplazamiento horizontal (móvil) no eran alcanzables con teclado: ahora tienen foco y nombre.
- Salto de nivel de títulos en Metodología (h3 sin h2).
- El informe desbordaba a 360 px: corregido (se probó desde 320 px).
- Los saldos negativos se partían en dos líneas («−» / «$99,00»): ahora se mantienen juntos.

## Qué quedó automatizado en CI
`npm run a11y` (axe), `npm run lighthouse` (falla si accesibilidad o rendimiento bajan de 95), `npm run e2e` contra el HTML y contra el sitio real, y `npm run visual` (capturas de 7 vistas). El e2e ahora cubre teclado (primer foco, saltar al contenido, tabulación hasta el informe, Enter y Escape).

## Límites
- **Pruebas visuales:** las capturas de referencia se generaron en este entorno; las fuentes del sistema pueden variar en CI, por eso ese paso está como informativo hasta fijar las capturas en la primera ejecución de CI.
- **axe y Lighthouse no sustituyen a un lector de pantalla:** detectan una parte de los problemas. Por eso va el guion de 10 pasos.
- **Modo impresión:** está resuelto para el informe (A4, solo se imprime el informe). Las demás páginas no tienen hoja de estilos de impresión propia.
- Buenas prácticas 96 en algunas rutas: son mapas de código fuente ausentes en producción (no afecta al usuario).
- Microcopy: no hice una reescritura general; los textos nuevos de portada, escenarios e informe siguen pendientes de tu lectura.

## Qué necesito de ti
1. **Pasada de 30 minutos con un lector de pantalla** siguiendo `docs/guion-lector-de-pantalla.md` (yo no puedo escucharlo). Esto estaba previsto para la semana 7.
2. Confirmar si quieres que las pruebas visuales bloqueen el CI desde el inicio o queden informativas.
