# Lista de verificación de lanzamiento

Marca cada punto con fecha y responsable. **Bloqueantes** = no se publica sin ellos.

## Contenido y datos
- [ ] **Bloqueante · Tasas del BCE verificadas en fuente primaria** (13 tasas; hoy rotuladas «sin verificar»).
- [ ] Número del Registro Oficial de la resolución JPRFM-2026-033-F confirmado.
- [ ] Comunicado de la SEPS y alertas de estafa verificados en su fuente.
- [ ] Precios de Equifax y RedClic y URL de Aval Buró confirmados (o retirados del sitio).
- [ ] `npm run validate:data` sin datos desactualizados (> 60 días).

## Metodología
- [ ] **Bloqueante · Umbrales aprobados por el analista** (`aprobado: true` en `src/lib/metodologia.ts`) y cambio de estado de «borrador».
- [ ] Muestra de 10 casos recalculada a mano y dudosos decididos (`docs/fase1-entrega.md`).
- [ ] Informe leído como lo leería una entidad financiera; decisión sobre el nombre opcional.

## Legal
- [ ] **Bloqueante · Revisión jurídica realizada** (`docs/dossier-juridico.md`) y ajustes aplicados a `/privacidad` y `/terminos`.
- [ ] **Bloqueante · Operador y nombre definitivos** (persona o sociedad; SENADI).
- [ ] Compatibilidad con el empleo municipal confirmada por la institución.
- [ ] Solicitud de licencia a la Superintendencia de Compañías enviada (la comparación sectorial sigue desactivada si no hay respuesta).

## Técnico
- [ ] CI en verde: tipos, pruebas, datos, e2e (HTML y sitio real), axe, Lighthouse ≥ 95.
- [ ] Pruebas visuales con capturas fijadas en CI.
- [ ] Cabeceras de seguridad verificadas en la URL real (`docs/despliegue.md`, paso 4).
- [ ] `/api/health` responde; `robots.txt` y sitemap correctos con `NEXT_PUBLIC_BETA` apagado.
- [ ] Dominio comprado, DNS y HTTPS activos; `NEXT_PUBLIC_SITE_URL` actualizado.
- [ ] Prueba final de cero peticiones de red en el sitio publicado.

## Accesibilidad
- [ ] **Bloqueante · Pasada con lector de pantalla** (`docs/guion-lector-de-pantalla.md`) sin ✖.

## Beta
- [ ] 5 a 10 probadores elegidos (personas naturales y jurídicas) y avisados.
- [ ] Beta realizada; sin hallazgos críticos abiertos (jurídicos, de seguridad o de comprensión).
- [ ] Métricas: ≥ 70 % completó el diagnóstico; ≥ 80 % entendió que no es un score.

## Lanzamiento y después
- [ ] **Bloqueante · Autorización expresa para publicar.**
- [ ] `NEXT_PUBLIC_BETA` apagado y sitio vuelto a desplegar.
- [ ] Correo de contacto con responsable y plazo de respuesta.
- [ ] Tarea mensual de verificación de tasas y revisión trimestral de la metodología.
