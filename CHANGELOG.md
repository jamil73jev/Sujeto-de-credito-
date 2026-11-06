# Historial de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Sin publicar]

### Cambiado
- **Nuevo nombre del proyecto: «Listo para Crédito»** (antes «¿Soy sujeto de crédito? Ecuador»). Se actualizan la marca del sitio y del informe, el título de la página, la documentación, las fuentes de diseño y el nombre del archivo de un solo HTML (`dist/listo-para-credito.html`). No cambian el alcance, la metodología ni los datos.

### Agregado
- `docs/diseno.md` con el mapa del producto, la portada «azul + lima» y la línea gráfica (colores, tipografía, componentes y reglas), con capturas en `docs/img/`.

## [0.1.0] - 2026-11-05

Primera versión del repositorio: sitio de elegibilidad de crédito para personas y empresas, preparado para una beta cerrada.

### Agregado
- **Elegibilidad de crédito** para personas y empresas, con cálculo en vivo en el navegador y resultados orientativos (favorable, condicionado, débil, insuficiente).
- **Metodología v1.1 (borrador):** umbrales aprobados por el analista (cuotas sobre ingreso menos de 30 %, atención hasta 50 %, endeudamiento de empresa 70 %, DSCR que afecta el nivel) y valor exacto en el límite en «atención».
- **Informe imprimible** de diagnóstico con folio, fichas técnicas de indicadores y umbrales con su origen; se genera sin servidor.
- **Datasets de referencia** con fuente, fecha y confianza, validados con esquemas Zod; lo no confirmado queda `null` y documentado en `data/vacios.json`.
- **Accesibilidad y rendimiento verificados:** axe sin violaciones y Lighthouse con accesibilidad 100 y rendimiento de 95 a 100; Lighthouse usa la mediana de 3 mediciones en CI.
- **Seguridad:** cabeceras estrictas, página de comentarios sin servidor que bloquea datos personales y modo beta sin indexación (`NEXT_PUBLIC_BETA=1`).
- **Documentación:** plan de profesionalización, entregas por fase, guía de despliegue, lista de verificación de lanzamiento, guion de la beta, dossier jurídico y borrador de solicitud de licencia.
- `AVISO.md` y `SEGURIDAD.md`.

### Pendiente antes de lanzar
- Revisión jurídica de términos, privacidad y dossier.
- Contraste de tasas y normas con las fuentes oficiales (BCE, Superintendencia de Compañías, Registro Oficial).
- Comparación sectorial desactivada hasta confirmar datos y licencia de uso.
- Pasada con lector de pantalla y definición de operador, nombre y dominio.
