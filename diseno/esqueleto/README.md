# Esqueleto del producto (diseño)

Fuentes del lienzo de diseño **«Esqueleto: Listo para Crédito»**: un mapa pantalla por pantalla de lo que se construye y en qué fase del [plan de profesionalización](../../docs/plan-de-profesionalizacion.md) llega cada pieza (etiquetas «Existe hoy» y «Nuevo · Fase N»).

| Archivo | Contenido |
| --- | --- |
| `canvas.json` | Índice del lienzo: posición y tamaño de cada tablero |
| `Main.dc.html` | Mapa del producto (sitio, flujo del dato, capas internas) |
| `Portada.dc.html` | 1 · Portada, azul + lima |
| `Personas.dc.html` | 2 · Formulario y panel vivo de personas |
| `Empresas.dc.html` | 3 · Formulario y panel vivo de empresas |
| `Informe.dc.html` | 4 · Informe de diagnóstico imprimible |
| `Metodologia.dc.html` | 5 · Metodología y fuentes |
| `LineaGrafica.dc.html` | Línea gráfica (colores, tipografía, componentes) |

Notas:

- Los textos entre corchetes (`[Nivel]`, `[$]`, …) son marcadores, no datos.
- Los `.dc.html` son fuentes del editor de diseño y cargan `./support.js`, que no se incluye; para verlos con el editor, abre el lienzo original. Una versión autocontenida para el navegador está en [`prototipos/esqueleto-sujeto-de-credito-ecuador.html`](../../prototipos/esqueleto-sujeto-de-credito-ecuador.html).
- Resumen escrito con capturas: [`docs/diseno.md`](../../docs/diseno.md).
- La app real vive en `src/`; este diseño es la referencia visual y de alcance.
