# Fase 5 · Beta y lanzamiento · paquete de preparación

Todo lo siguiente está preparado y comprobado **en local**. No se publicó nada ni se envió nada a terceros.

## Qué se construyó
- **Cabeceras de seguridad** (`security-headers.mjs`): CSP sin orígenes externos ni plugins, HSTS, no incrustable, sin sniffing, políticas de apertura y de recursos entre orígenes, sensores y pagos denegados, sin `x-powered-by`. HSTS **sin** `preload` ni subdominios hasta tener dominio definitivo. 6 pruebas unitarias y una prueba e2e sobre el sitio real que lee las cabeceras servidas.
- **Página «Comentarios»** (`/comentarios`, enlazada en el pie): sin servidor y sin recoger datos. Arma un correo desde el propio programa de correo de la persona (o permite copiar el mensaje), nunca incluye datos del diagnóstico y **bloquea el envío si el texto parece traer una cédula, un RUC, un teléfono o un correo**.
- **Modo beta** (`NEXT_PUBLIC_BETA=1`): no se indexa, `robots.txt` bloquea todo, sitemap vacío y aviso «Versión de prueba» con enlace a comentarios. Al lanzar se apaga.
- **Informe y teclado:** mientras el informe está abierto, el resto de la página queda inerte (sin foco ni lectura).
- **Documentos** (en `docs/`): `dossier-juridico.md` (qué datos se tratan, marco normativo y 10 preguntas para quien revise), `despliegue.md` (pasos, variables, cabeceras, reversión), `lista-verificacion-lanzamiento.md` (con los bloqueantes marcados), `beta-guion.md` (invitación, 6 tareas, qué observar, cómo clasificar hallazgos).

## Evidencia
164 pruebas unitarias en verde; e2e en verde contra el HTML y contra el sitio real; axe sin violaciones en 40 revisiones (con y sin el aviso de beta); Lighthouse 95 a 100 en rendimiento y 100 en accesibilidad.
Corregí de paso el tamaño del objetivo táctil de los deslizadores, que con el aviso de beta quedaba por debajo de los 24 px que pide WCAG 2.2.

## Qué necesito de ti (todo lo externo es tuyo)
1. **Revisión jurídica:** elegir quién (el dossier es un borrador de una IA, no una opinión legal) y entregarle `dossier-juridico.md`. Incluye una pregunta que solo la Municipalidad puede resolver (compatibilidad con tu empleo).
2. **Operador y nombre definitivos** (persona o sociedad; SENADI) y **dominio** (el precio de un `.ec` no lo verifiqué).
3. **Elegir 5 a 10 probadores** (personas naturales y jurídicas) y enviarles la invitación de `beta-guion.md`.
4. **Autorizar el primer despliegue de vista previa** (con `NEXT_PUBLIC_BETA=1`); yo no despliego sin tu visto bueno.
5. **Bloqueantes que siguen abiertos:** aprobar los umbrales, verificar las tasas del BCE, y tu pasada con lector de pantalla.

## Límites
- El correo de comentarios depende de que la persona tenga un programa de correo configurado; si no, puede copiar el mensaje.
- La detección de datos personales en comentarios es una ayuda, no una garantía.
- No probé el despliegue real ni las cabeceras en la URL pública; solo en `next start` local.
- La CSP mantiene `'unsafe-inline'` para scripts y estilos (lo necesita Next para hidratar). Endurecerla con nonces se evalúa después del lanzamiento.
