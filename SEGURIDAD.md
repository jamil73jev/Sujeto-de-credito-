# Seguridad

Este repositorio es **público**: todo lo que se suba queda visible, y también en el historial de git aunque se borre después.

## Qué nunca se sube

1. **Datos personales reales:** cédulas, RUC, teléfonos, correos, historiales o informes de personas o empresas reales. Los casos de referencia (`docs/casos-de-referencia.xlsx`) y las pruebas usan datos ficticios.
2. **Claves y credenciales:** tokens, claves de API, contraseñas o cadenas de conexión. El proyecto no necesita secretos ni base de datos.
3. **Configuración local:** `.env`, `.env.local` y la carpeta `.vercel/`. Solo se versiona `.env.example`, con marcadores.
4. **Archivos de terceros con condiciones de uso** (por ejemplo, descargas de la Superintendencia de Compañías) sin haber confirmado que se pueden republicar.

## Qué protege el sitio

- No guarda datos del usuario: todo se calcula en el navegador, sin cuentas, cookies de seguimiento ni analítica.
- Cabeceras de seguridad (`security-headers.mjs`): CSP sin orígenes externos, HSTS, sin incrustación, sin sniffing y permisos de sensores y pagos denegados.
- La página de comentarios bloquea el envío si el texto parece traer una cédula, un RUC, un teléfono o un correo.
- Cada cambio pasa por la verificación automática: tipos, pruebas, validación de datos, compilación, axe y Lighthouse.

## Si algo se subió por error

1. Cambiar o revocar la clave de inmediato.
2. Quitar el archivo del historial; borrarlo en un commit nuevo no basta.
3. Si eran datos personales reales, avisar a las personas afectadas.

## Reportar un problema de seguridad

Escriba al contacto publicado en el sitio y no publique el detalle en incidencias ni capturas.
