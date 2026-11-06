# Fase 2 · Informe de diagnóstico · paquete para aprobación

## Qué se construyó
- **Botón «Generar informe imprimible»** en los resultados de Personas y Empresas (aparece cuando hay datos suficientes).
- El informe se arma **en el navegador**, sin servidor, y se imprime o se guarda como PDF con el diálogo de impresión (A4).
- **Contenido (8 secciones):** 1 Resultado · 2 Resultado por dimensión · 3 Escenarios y sensibilidad · 4 Qué mejorar, en orden de prioridad (Corregir → Revisar → Completar) · 5 Qué llevar a la entidad · 6 Datos que declaraste · 7 Ficha técnica de los indicadores (fórmula, cómo leerlo, regla, advertencias, fuente) · 8 Umbrales usados y su origen. Cierra con el aviso legal completo y la advertencia de privacidad.
- **Encabezado:** folio, fecha, versión de la metodología (v1.1, borrador) y leyenda «estimación orientativa». Sin número único ni apariencia de score.
- **Folio** `P-AAAAMMDD-XXXXXX` (E- para empresas): fecha + huella de los datos y la versión. Cambia si cambian los datos; no identifica a nadie y no se guarda.
- **Nombre opcional** (razón social en empresas): se escribe en la pantalla del informe, aparece solo ahí y no se guarda. Hay un aviso de que quedará en el papel o PDF.
- **Siempre en «papel»**: fondo blanco y texto oscuro también con el modo oscuro del sistema; al imprimir se oculta todo lo demás.
- **Accesibilidad básica:** diálogo con foco atrapado y Escape para cerrar (el foco vuelve al botón), tablas con título y encabezados de fila/columna, sin desbordamiento horizontal desde 320 px. La auditoría formal (axe, Lighthouse, lector de pantalla) es la Fase 4.

## Evidencia
- 152 pruebas unitarias en verde (19 nuevas del informe: folio, orden de recomendaciones, fichas con fuente, reglas por ámbito).
- Prueba e2e sobre el HTML compilado: folio, secciones, nombre opcional, llamada a imprimir, vista de impresión (solo se ve el informe), PDF generado, teclado, móvil de 360 px y **cero peticiones de red** en todo el recorrido.
- Dos PDF de ejemplo generados con esta versión (persona, 5 páginas; empresa, 6 páginas).

## Qué necesito de ti
1. **Leer el informe como lo leería una entidad financiera** (los dos PDF de ejemplo): ¿el orden, el lenguaje y las fichas son los adecuados? ¿Falta algo que una entidad esperaría ver?
2. **Decidir el nombre opcional:** ¿se mantiene (con el aviso actual) o se quita para que el informe nunca lleve datos de identidad?
3. **Revisar el texto de «Qué llevar a la entidad»:** sale de los checklists del sitio (ejemplos de entidades concretas), no de una norma.
4. Recordatorio de la Fase 1 que sigue abierto: los umbrales siguen **sin aprobar** y el informe lo dice («Pendiente»). Cuando los apruebes, se actualiza el estado en `src/lib/metodologia.ts` y desaparece la leyenda de borrador.

## Límites que conviene conocer
- «Guardar como PDF» depende del navegador del usuario; no se genera un archivo PDF propio.
- La comparación con el sector no aparece en el informe porque sigue desactivada (Fase 3).
- No se ha probado con lector de pantalla real (queda para tu pasada de la Fase 4).
