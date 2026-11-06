# Despliegue (preparado, **no ejecutado**)

Nada se publica sin tu visto bueno. Esto deja el camino listo y comprobado en local.

## Variables de entorno
| Variable | Beta | Lanzamiento |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL de la vista previa | `https://tu-dominio.ec` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | correo de contacto | correo de contacto definitivo |
| `NEXT_PUBLIC_BETA` | `1` (no se indexa, `robots.txt` bloquea todo, sitemap vacío y aviso «Versión de prueba») | quitar o `0` |

No hay secretos ni base de datos. Las variables `NEXT_PUBLIC_*` se incrustan al compilar: cambiarlas exige volver a desplegar.

## Pasos (Vercel)
1. Subir el proyecto a un repositorio privado de GitHub y comprobar que CI está en verde.
2. Importar el repositorio en Vercel (detecta Next.js). Definir las variables de la columna «Beta».
3. Desplegar y abrir la URL de vista previa. Comprobar `GET /api/health` (debe devolver `status: ok`).
4. Comprobar las cabeceras: `curl -sI https://<vista-previa>/personas` debe mostrar `content-security-policy`, `x-frame-options: DENY`, `x-content-type-options: nosniff`, `strict-transport-security` y no mostrar `x-powered-by`.
5. Enviar la URL a los probadores (ver `docs/beta-guion.md`).
6. Al lanzar: comprar el dominio (**lo haces tú**), agregarlo en Vercel, apuntar el DNS según las instrucciones del panel, actualizar `NEXT_PUBLIC_SITE_URL`, quitar `NEXT_PUBLIC_BETA` y volver a desplegar.
7. Tras el lanzamiento, si se confirma el dominio definitivo, evaluar HSTS con `includeSubDomains` y `preload` (hoy desactivados a propósito: la lista de precarga es difícil de revertir).

## Antes de apretar el botón
- Revisa los términos del plan de Vercel: el plan gratuito suele ser para uso personal no comercial; confirma si aplica a este proyecto.
- El precio de un dominio `.ec` y de su registrador no lo verifiqué: consúltalo antes de fijar el presupuesto de 150 dólares.

## Revertir
En Vercel, «Deployments» → elegir el despliegue anterior → «Promote to Production». Para apagar el sitio temporalmente basta poner `NEXT_PUBLIC_BETA=1` y redesplegar (deja de indexarse; no lo oculta a quien tenga el enlace).

## Monitoreo mínimo
- `GET /api/health` (puede usarse con un monitor gratuito de disponibilidad).
- Correo de contacto revisado al menos una vez por semana durante la beta.
- Verificación mensual de tasas y datos (tarea programada propuesta; requiere tu aprobación).
