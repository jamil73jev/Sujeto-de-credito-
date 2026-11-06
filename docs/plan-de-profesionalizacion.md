# Plan de profesionalización: ¿Soy sujeto de crédito?

Nov 5, 2026 · @jamil

Este plan lo ejecuto yo de punta a punta (código, pruebas, metodología, verificación de fuentes, informe y documentación) y tú supervisas y apruebas en cada fase. Llevar el sitio a nivel buró es subir su rigor, no su alcance: sin score ni consulta de historiales, algo que solo hace un buró autorizado por la Superintendencia de Bancos. Con más de 6 horas semanales de tu parte estimo de 8 a 10 semanas hasta la beta cerrada. El lanzamiento público depende de trámites externos que solo tú puedes gestionar (estimación mía, a ajustar).

## Cómo trabajamos

Cada fase termina con un paquete de entrega: lo construido funcionando, la evidencia (pruebas en verde, capturas, registro de fuentes) y la lista de lo que cambió. Tú lo revisas en una sesión, apruebas o devuelves ajustes, y solo entonces paso a la siguiente. Nada se publica ni se envía a terceros sin tu visto bueno.

| Lo ejecuto yo | Lo decides o gestionas tú |
| --- | --- |
| Código, pruebas y compilación | Aprobar cada fase viendo el sitio funcionando |
| Metodología con cada umbral y su origen | Validar los umbrales como analista financiero: son tu criterio, no el mío |
| Verificación de datos en fuentes primarias, con URL y fecha | Lo que exija sesión iniciada o pago (por ejemplo, precios de Equifax) |
| Casos de referencia recalculados por una vía independiente | Revisar una muestra de 10 casos y decidir los dudosos |
| Informe, accesibilidad y rendimiento | Leer el informe como lo leería una entidad financiera |
| Borradores de la solicitud de licencia, términos y dossier jurídico | Enviarlos, firmarlos y pagar |
| Preparación del despliegue y lista de verificación de lanzamiento | Comprar el dominio, autorizar y publicar |

Entre sesiones no conservo memoria de lo hecho: el estado vive en el repositorio (CHANGELOG, registro de decisiones y de fuentes) y en este documento.

## Alcance y línea roja

Nivel buró significa seis cosas: metodología auditable, datos con fuente verificada, profundidad analítica, informe formal, cumplimiento legal y operación con gobierno. Lo que hace único a un buró (datos de terceros y score oficial) queda fuera por diseño.

| Lo que hace un buró | Qué hacemos en su lugar |
| --- | --- |
| Consolida historial de terceros | No consultamos a nadie: llevamos al titular a los canales oficiales |
| Emite un score propio | Veredicto por dimensiones, sin número único ni apariencia oficial |
| Conserva datos de personas | No guardamos nada: todo se calcula en el navegador |
| Responde ante la Superintendencia de Bancos | Metodología pública, versionada y con fuentes citadas |

## Qué tomar del ejemplo adjunto

El ejemplo (`sujeto_credito_ec_pro.html`) acierta en la presentación y en los escenarios, pero añade sus mejoras inyectando elementos al DOM con un script aparte. Eso es frágil: conviene portarlas como componentes del proyecto.

| Elemento del ejemplo | Decisión | Cómo llevarlo al proyecto |
| --- | --- | --- |
| Portada con dos llamadas a la acción y vista previa | Adoptar | Componente de portada; la vista previa sin cifras que parezcan mediciones |
| Tarjetas de privacidad, cálculo transparente y fuentes | Adoptar | Tres tarjetas cortas que enlazan a privacidad, metodología y verificaciones |
| Tira de KPIs sobre el panel | Adoptar | Cuota sobre ingreso, ingreso disponible, DSCR y razones clave, con su fórmula |
| Escenarios de capacidad disponible (caída de ingreso) | Adaptar | Tres escenarios (base, moderado, severo) para personas y para empresas |
| Imprimir diagnóstico | Adaptar | Informe formal con folio, versión de metodología y supuestos (Fase 2) |
| Ver fórmulas y desglose de indicadores propios | Adoptar | Ficha técnica por indicador: fórmula, lectura y fuente |
| Barras ilustrativas de 76 % y 62 % en la portada | Evitar | Cifras decorativas que el público leerá como medición |
| Mejoras inyectadas por script sobre el HTML ya generado | Evitar | Reescribir como componentes React con pruebas |

## Brechas frente a nivel buró

Las cuatro primeras son las que más pesan en la credibilidad: sin ellas, el resto es presentación.

| Área | Hoy | Meta | Prioridad |
| --- | --- | --- | --- |
| Metodología | Umbrales propios sin fuente (cuota sobre ingreso 40 %, estrés 20 %) | Política escrita, versionada y aprobada por ti, con recálculo independiente | Alta |
| Datos de mercado | Tasa del BCE y alertas tomadas del informe, confianza media | Fuente primaria abierta y verificada, con fecha | Alta |
| Pruebas de la lógica | 69 pruebas unitarias | Casos de referencia recalculados por una vía independiente y muestreados por ti (personas y empresas) | Alta |
| Cumplimiento | Sin revisión jurídica ni correo de contacto | Revisión de LOPDP y términos, contacto publicado | Alta |
| Informe | Solo el panel en pantalla | Informe imprimible con folio, supuestos y recomendaciones | Media |
| Empresas | Razones con saldo de cierre, un solo año | Promedios, dos o más cierres, flujo y DSCR | Media |
| Comparación sectorial | Desactivada, sin datos | Percentiles por CIIU y tamaño con al menos 30 empresas, licencia confirmada | Media |
| Escenarios | Una prueba de estrés | Tres escenarios y análisis de sensibilidad | Media |
| Accesibilidad y rendimiento | Sin auditoría | WCAG 2.2 AA y Lighthouse de al menos 95 | Media |
| Operación | Pruebas e2e hechas a mano | CI con pruebas e2e, changelog y actualización mensual de datos | Baja |

## Hoja de ruta

*(En el documento original aquí hay una hoja de ruta visual con las 6 fases y los 3 trámites a tu cargo; no se exporta a Markdown. El detalle está en las secciones siguientes.)*

Las bandas van del mismo tamaño y no a escala. La Fase 3 (en azul) depende de una licencia externa: si tarda, las demás fases siguen y el sitio sale sin comparación sectorial. El lanzamiento público espera la revisión jurídica. Si la semana 1 es la del lunes 9 de noviembre, las semanas 7 y 8 caen en las fiestas de fin de año y los plazos externos pueden alargarse.

## Detalle por fase

**Fase 0. Cimientos (semana 1).**

- **Entrego yo:** repositorio con CI (tipos, pruebas, validación de datos y e2e); verificación en fuente primaria de la tasa del BCE, la resolución JPRFM-2026-033-F y las alertas de la SEPS, con URL y fecha en el registro de fuentes; portada, tarjetas y KPIs del ejemplo como componentes con pruebas; borrador de la solicitud de licencia a la Superintendencia de Compañías.
- **Apruebas tú:** el borrador de la solicitud (la envías tú) y qué datos de mercado se quedan, se rotulan como no verificados o se retiran.
- **Salida:** CI verde y ningún dato de mercado sin fuente primaria o sin rotular. Lo que exija sesión iniciada o pago (precios de Equifax y RedClic, URL oficial de Aval Buró) queda marcado como pendiente tuyo.

**Fase 1. Motor de evaluación (semanas 2 y 3).**

- **Entrego yo:** metodología v1 con cada regla, umbral y origen, separando lo normativo de lo que es supuesto propio; versión de la metodología visible en pantalla; tres escenarios (base, moderado, severo) y análisis de sensibilidad; empresas con promedios de dos cierres, serie de varios años, flujo y DSCR; al menos 30 casos de personas y 20 de empresas, recalculados en una hoja de cálculo aparte del código.
- **Apruebas tú:** cada umbral, como analista financiero, y una muestra de 10 casos más los que yo marque como dudosos.
- **Salida:** casos aprobados, metodología publicada y todo umbral con origen o rotulado como supuesto. Como yo escribo el código y el recálculo, no soy un revisor independiente de mi propio trabajo: tu muestra es el control real.

**Fase 2. Informe de diagnóstico (semanas 4 y 5).**

- **Entrego yo:** informe imprimible o PDF generado en el navegador, sin servidor, con folio, fecha, versión de la metodología, datos declarados, resultado por dimensión, escenarios, recomendaciones priorizadas, fuentes y aviso; lista de documentos que llevar a la entidad; ficha técnica por indicador (fórmula, lectura y fuente).
- **Apruebas tú:** el informe leído como lo leería una entidad financiera, y la decisión sobre el nombre opcional del usuario.
- **Salida:** informe legible en papel y accesible, con una prueba que confirma que no se hace ninguna petición de red con los datos.

**Fase 3. Datos sectoriales (1 semana, cuando llegue la licencia).**

- **Entrego yo:** script de benchmarks ejecutado con los CSV reales y mapeo de columnas ajustado; comparación activada con percentiles p10 a p90 y sin celdas de menos de 30 empresas; contraste contra una muestra de empresas.
- **Apruebas tú:** que la licencia permite reutilizar el ranking, y me adjuntas los CSV (el entorno donde trabajo no accede a ese sitio).
- **Salida:** licencia confirmada y muestra verificada. Sin licencia, la comparación sigue desactivada.

**Fase 4. Experiencia y confianza (semanas 6 y 7).**

- **Entrego yo:** auditoría de accesibilidad con axe y navegación por teclado, Lighthouse sobre un Chromium local, rendimiento, microcopy, modo impresión, pruebas visuales y e2e en CI.
- **Apruebas tú:** una pasada de 30 minutos con un lector de pantalla real (yo no puedo escucharlo), con un guion de 10 pasos que te dejo listo.
- **Salida:** 95 o más en accesibilidad y rendimiento de Lighthouse, sin errores en consola.

**Fase 5. Beta y lanzamiento (semanas 8 a 10).**

- **Entrego yo:** dossier de revisión jurídica (LOPDP, términos, avisos, qué datos se tratan y cuáles no), cabeceras de seguridad, configuración de despliegue, lista de verificación de lanzamiento y formulario de comentarios que no recoge datos personales.
- **Gestionas tú:** la consulta jurídica, el dominio, la beta con 5 a 10 personas que elijas y la autorización de publicar.
- **Salida:** visto bueno jurídico y beta sin hallazgos críticos.

**Continuo.** Cada mes verifico las tasas y te envío el resumen de cambios para que apruebes; cada trimestre reviso la metodología y vigilo las resoluciones de la Junta de Política y Regulación Financiera. Si lo apruebas, lo dejo como tarea programada.

## Hitos a tu cargo

| Hito | Cuándo | Qué te dejo listo |
| --- | --- | --- |
| Enviar la solicitud de licencia a la Superintendencia de Compañías | Semana 1 | Borrador con la base legal y el uso previsto |
| Aprobar los umbrales de la metodología | Semanas 2 y 3 | Tabla de umbrales con origen y alternativa |
| Revisar 10 casos de referencia | Semana 3 | Casos con el cálculo paso a paso |
| Probar con lector de pantalla | Semana 7 | Guion de 10 pasos |
| Consultar a quien revise LOPDP y términos | Desde la semana 6, plazo externo | Dossier jurídico de 2 a 3 páginas |
| Elegir 5 a 10 personas para la beta | Semana 8 | Guion y formulario de comentarios |
| Comprar el dominio y autorizar la publicación | Antes de publicar | Instrucciones de despliegue y lista de verificación |

## Límites que conviene tener claros

- No soy un revisor independiente de mi propio trabajo: tus umbrales y tu muestra de casos son el control real.
- No puedo dar el visto bueno jurídico ni sustituir a la Superintendencia o a un abogado.
- No puedo garantizar la licencia ni su plazo.
- No conservo memoria entre sesiones: el estado vive en el repositorio y en este documento.
- Lo que exige sesión iniciada, pago o un lector de pantalla real queda en tus manos.
- Las fechas son estimaciones mías y cambian si cambia tu disponibilidad.

## Métricas de éxito

| Indicador | Meta |
| --- | --- |
| Datos de mercado con fuente primaria, fecha y confianza | 100 % |
| Parámetros con origen documentado o rotulados como supuesto | 100 % |
| Casos de referencia recalculados de forma independiente | 50 o más (30 de personas, 20 de empresas), sin diferencias salvo redondeo |
| Casos revisados por ti | Muestra de 10 más los dudosos |
| Accesibilidad y rendimiento en Lighthouse | 95 o más |
| Pruebas e2e en CI | Todas en verde en cada cambio |
| Actualización de tasas tras la publicación del BCE | 5 días o menos |
| Finalización del diagnóstico en la beta | 70 % o más, según los testers (el sitio no recoge analítica) |
| Hallazgos críticos jurídicos o de seguridad abiertos al lanzar | 0 |

## Riesgos

| Riesgo | Efecto | Mitigación |
| --- | --- | --- |
| Que el público lo tome por un buró o un score oficial | Decisiones mal informadas y exposición legal | Sin número único, aviso fijo, informe con la leyenda orientativo |
| La licencia no llega o llega tarde | Comparación sectorial bloqueada | Se envía en la semana 1; si no llega, el sitio sale sin ella |
| Revisión jurídica lenta, sobre todo en diciembre y enero | Lanzamiento público tardío | Dossier listo antes de la semana 6; la beta puede correr sin dominio propio |
| Umbrales propios que parecen norma | Pérdida de credibilidad ante analistas | Rotularlos como supuesto y que los apruebes tú |
| Errores míos sin detectar, por no haber revisor independiente | Veredictos equivocados | Recálculo aparte, tu muestra de casos y pruebas con casos límite |
| Fuentes que cambian de formato o de URL | Datos desactualizados | Verificación mensual y marca de vigencia en cada dato |
| El informe impreso expone datos personales | Fuga de información en el equipo del usuario | Nombre opcional, nada guardado y aviso al imprimir |
| Pérdida de contexto entre sesiones | Retrabajo | CHANGELOG, registro de decisiones y de fuentes en el repositorio |
| Crecimiento del alcance | Retraso de las fases | Todo cambio nuevo pasa por tu aprobación y se asigna a una fase |

## Decisiones que necesito de ti

Con tus respuestas fijo la Fase 0 y empiezo; no cambio el proyecto hasta que apruebes cada fase.

- [ ] ¿Empezamos el lunes 9 de noviembre (semana 1)?
- [ ] ¿Quién hará la revisión jurídica?
- [ ] ¿Publicas con tu nombre o con una marca del proyecto?
- [ ] ¿Prioridad inicial: personas o empresas?
- [ ] ¿El informe puede llevar un nombre opcional escrito por el usuario, sin guardarlo?
- [ ] ¿Hay presupuesto para la revisión jurídica y para un dominio propio?
- [ ] ¿Qué correo de contacto uso para privacidad y términos?
- [ ] ¿Quiénes serían las 5 a 10 personas de la beta?
