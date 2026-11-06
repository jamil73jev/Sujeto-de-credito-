# Dossier para la revisión jurídica (borrador)

> **Aviso:** lo preparó Claude (una IA), no un abogado. Ordena los hechos y las preguntas para que quien haga la revisión (abogado o asesor en protección de datos) decida. Nada de aquí es una opinión legal.

## 1. Qué es el sitio
Herramienta gratuita y orientativa para que personas y empresas de Ecuador se autoevalúen como sujetos de crédito: ven qué miran las entidades y qué podrían mejorar. **No** es un buró, no emite score, no consulta historiales, no aprueba ni preaprueba créditos. Para ver el historial real enlaza a los canales oficiales (Superintendencia de Bancos, SRI, etc.).
Operador: pendiente de definir (ver pregunta 1). Nombre de marca: «Listo para Crédito» (antes «¿Soy sujeto de crédito? Ecuador»); falta verificar la marca en SENADI y el dominio .ec. Correo de contacto: thundertech73@gmail.com.

## 2. Qué datos se tratan, dónde y por cuánto tiempo
| Dato | Dónde ocurre | ¿Se envía o se guarda? |
|---|---|---|
| Datos financieros que la persona escribe (ingresos, gastos, cuotas, score declarado, balance de la empresa, etc.) | Solo en el navegador de la persona, en memoria | **No** se envían a ningún servidor, no se guardan en cookies ni almacenamiento del navegador, no se registran |
| Informe imprimible (con folio y, opcionalmente, nombre o razón social) | En el navegador; la persona lo imprime o lo guarda como PDF en su equipo | **No** se envía ni se guarda; el nombre es opcional y solo vive en la pantalla |
| Mensaje de comentarios | Se arma en el navegador y se envía **desde el correo de la propia persona** al correo de contacto | Llega al correo de contacto solo si la persona lo envía; el formulario avisa que no escriba datos personales y detecta cédulas, RUC, teléfonos y correos |
| Registros técnicos de la conexión (por ejemplo, dirección IP) | Proveedor de alojamiento | Los genera el proveedor por seguridad y funcionamiento; el sitio no los usa |
| Cuentas, cookies de seguimiento, analítica, publicidad | No existen | — |

Garantías técnicas verificables: política de seguridad de contenido (CSP) que impide cargar o enviar a orígenes externos (`connect-src 'self'`); una prueba automática confirma **cero peticiones de red** durante todo el diagnóstico y la generación del informe; no hay scripts, tipografías ni imágenes de terceros.

## 3. Marco normativo que ya está registrado en el proyecto
Cada uno con su fuente y fecha en `data/normativa.json`:
- Ley Orgánica de Protección de Datos Personales (LOPDP) y su Reglamento General (Decreto 904); guía de derechos de la Superintendencia de Protección de Datos Personales.
- Código Orgánico Monetario y Financiero, arts. 357 y 358 (referencias crediticias y reglas de transmisión de información).
- Resolución JPRFM-2026-033-F (Registro de Datos Crediticios y burós).
- Calificación de cartera (SEPS): cada entidad aplica la suya; no es el score de un buró.

## 4. Preguntas para quien revise
1. **Responsable del tratamiento.** El sitio no almacena datos, pero recibe correos si alguien escribe. ¿Quién debe figurar como responsable: una persona natural o una sociedad? ¿Hace falta delegado de protección de datos?
2. **Alcance de la LOPDP.** ¿Aplica cuando el cálculo ocurre solo en el dispositivo de la persona y el operador nunca accede a los datos? ¿Qué debe decir la política para ser exacta sin sobreprometer?
3. **Correo de contacto y comentarios.** Base de legitimación, aviso en el momento de recoger, plazo de conservación y procedimiento para supresión. Texto actual en `/privacidad`.
4. **Alojamiento fuera del país.** El proveedor previsto (Vercel) opera en EE. UU. y registra la IP. ¿Se considera transferencia internacional? ¿Qué debe informarse?
5. **Términos de uso.** Limitación de responsabilidad, uso por terceros sin autorización, y su validez frente a la normativa de defensa del consumidor. Texto actual en `/terminos`.
6. **Uso de palabras como «buró», «score» y «sujeto de crédito».** El COMF reserva el servicio de referencias crediticias a la Superintendencia de Bancos y a las entidades autorizadas. ¿Basta con el aviso fijo y con no emitir un puntaje, o debe ajustarse el lenguaje?
7. **Datos públicos citados.** Tasas, requisitos de entidades y normativa se muestran con fuente y fecha. ¿Hay restricciones de reutilización o de cita? Pendiente aparte: la **licencia del ranking de la Superintendencia de Compañías** (solicitud en `docs/solicitud-licencia-supercias.md`).
8. **Marca y dominio.** Registro del nombre en SENADI y requisitos de un dominio `.ec`. Aún no hay nombre definitivo.
9. **Beta con personas reales.** ¿Qué aviso o consentimiento previo conviene antes de invitarlas, y cómo se tratan sus comentarios?
10. **Actividad fuera de la Municipalidad.** Si el responsable es servidor municipal: confirmar con la institución si la actividad es compatible, y dejar claro que el proyecto no usa datos, tiempo ni recursos municipales. Esto no lo puede resolver una IA.

## 5. Riesgos que identifiqué (para contrastar, no como conclusión)
- Que el público lo confunda con un buró o con una aprobación → mitigado con aviso fijo, informe con leyenda «estimación orientativa» y sin número único.
- Umbrales propios que parezcan norma → rotulados «supuesto del proyecto» y pendientes de aprobación del analista.
- Datos de mercado desactualizados → cada dato lleva fecha y marca de vigencia; tasas del BCE aún sin verificar en fuente primaria (el sitio no pudo abrirla).
- Que alguien escriba datos personales en comentarios → advertencia y detección automática, pero es una ayuda, no una garantía.

## 6. Documentos que acompañan
`/privacidad` y `/terminos` (textos vigentes), `docs/verificacion-fuentes-fase0.md`, `docs/solicitud-licencia-supercias.md`, `docs/fase1-entrega.md` (metodología y umbrales), `docs/fase2-entrega.md` (informe).
