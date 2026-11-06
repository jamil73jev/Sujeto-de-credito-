# Fase 1 · Motor de evaluación · paquete para aprobación

Metodología **v1.1 (borrador: todos los umbrales aprobados; falta revisión legal y verificación de fuentes)**, 5 de noviembre de 2026.
Estado: el analista delegó en Claude el recálculo de los 10 casos y la decisión de los umbrales restantes (5-nov-2026). Claude recalculó los 10 casos con aritmética aparte del motor y de la hoja (todos coinciden) y dejó los valores de la sección B tal como estaban, ahora aprobados. Sigue siendo recomendable que el analista revise la sección B y D.

## A. Decisiones del analista ya aplicadas (motor, hoja de casos, pruebas, pantallas)

| Regla | Antes | Decisión |
|---|---|---|
| Cuotas totales sobre ingreso | hasta 40 % | **menos de 30 %** cumple |
| Margen de «atención» sobre el máximo | +10 puntos | **+20 puntos** (30 % a 50 % atención; más de 50 % no cumple) |
| Endeudamiento máximo de la empresa | 80 % | **70 %** |
| DSCR (flujo ÷ servicio de la deuda) | solo informaba, 1,2 | **afecta el nivel**: más de 1,2 cumple; de 1,0 a 1,2 atención; menos de 1,0 no cumple. Solo cuenta si la empresa declara flujo y servicio de deuda |
| Valor exactamente igual al límite | cumplía | **queda en atención** (un solo interruptor: `FRONTERA_EN_ATENCION` en `parametros.ts`). No se aplica a la mayoría de edad ni a la tolerancia del balance |
| Prueba de estrés por defecto | ingreso −20 %, cuotas +0 % | se mantiene |
| Documentos faltantes | volvían «Condicionado» | **informan, no cambian el nivel** (etiqueta «Solo informa» en pantalla e informe) |
| Simulador de la portada | mostraba el nivel | muestra **«Preliminar: …»** |

El ejemplo de la portada pasó de cuota nueva 150 a 90 USD: con 30 % de máximo, 120 + 150 sobre 900 de ingreso quedaba justo en el límite (30 %) y el simulador arrancaba en «condicionado».

## B. Umbrales decididos por delegación (se conservan los valores propuestos)

| Regla | Valor aprobado | Origen | Alternativa descartada |
|---|---|---|---|
| Antigüedad ingreso dependencia / independiente | más de 6 / más de 3 meses | Ejemplo BanEcuador | 12 meses más exigente |
| Score favorable / rechazo frecuente | más de 650 / menos de 300 | Referencia de prensa | sin respaldo oficial; es opcional |
| RUC sólido / insuficiente | más de 3 años / menos de 1 año | Ejemplo Banco Pichincha / supuesto | 2 años más exigente |
| Razón corriente mínima | más de 1,0 | Convención | depende del sector |
| Margen neto mínimo | más de 0 % | Convención | 2 % más exigente |
| Cobertura de intereses mínima | más de 1,0 | Convención | 1,5 habitual |
| Escenario moderado / severo | −10 % y +10 % / −25 % y +20 % | Supuesto | solo informan, no cambian el nivel |
| Mayoría de edad, tolerancia del balance | 18 años / 5 % | Norma / validación del dato | no aplica |

## C. Diez casos para recalcular a mano

Regla del nivel: algún «no cumple» → Débil; algún «atención» → Condicionado; si no, Favorable. Los factores «Solo informa» no cuentan.
Fórmulas: cuotas % = (actuales + nueva) ÷ ingreso; disponible = ingreso − gastos − cuotas; estrés % = (cuotas × (1 + alza)) ÷ (ingreso × (1 − caída)).
Por defecto el estrés es ingreso −20 % y cuotas +0 %. Límites: cuotas cumple por debajo de 30 %, atención de 30 % a 50 % inclusive; endeudamiento cumple por debajo de 70 %; DSCR cumple por encima de 1,2.

| Caso | Datos clave | Cuotas % | Disponible | Estrés % | Nivel esperado |
|---|---|---|---|---|---|
| P01 | ingreso 1.500, gastos 600, cuotas 100+200, 24 meses, score 700, docs 3/3 | 20,0 | 600 | 25,0 | **Favorable** |
| P03 | ingreso 1.000, gastos 300, cuotas 200+100, 12 meses, sin score ni docs | 30,0 | 400 | 37,5 | **Condicionado** (30 % exacto = atención; el estrés también supera 30 %) |
| P04 | igual con cuota nueva 99 y **sin estrés** (0 % / 0 %) | 29,9 | 401 | 29,9 | **Favorable** (29,9 % cumple; sin dato de score ni docs no condiciona) |
| P06 | ingreso 1.000, gastos 200, cuotas 300+201 | 50,1 | 299 | 62,6 | **Débil** (más de 50 %) |
| P09 | dependencia con 6 meses exactos, ingreso 1.200, gastos 400, cuota nueva 150 | 12,5 | 650 | 15,6 | **Condicionado** (6 meses exactos = atención) |
| P17 | ingreso 2.000, gastos 700, cuotas 100+200, 30 meses, score 651 | 15,0 | 1.000 | 18,75 | **Favorable** (651 > 650) |
| P21 | ingreso 2.000, gastos 1.700, cuotas 100+200 | 15,0 | 0 | 18,75 | **Condicionado** (disponible exactamente 0 = atención; con el estrés queda negativo) |
| P25 | ingreso 1.800, gastos 500, cuotas 100+200, docs 2 de 3 | 16,7 | 1.000 | 20,8 | **Favorable** (documentos incompletos: solo informa) |
| E04 | pyme de ejemplo con activo 250.000, pasivo 175.000, patrimonio 75.000 | endeudamiento 70,0 % | – | – | **Condicionado** (70 % exacto = atención) |
| E21 | pyme de ejemplo con flujo 36.000 y servicio de deuda 30.000 | DSCR 1,20 | – | – | **Condicionado** (1,2 exacto = atención) |

La hoja `docs/casos-de-referencia.xlsx` trae los 53 casos (30 de personas, 23 de empresas) con todas las columnas intermedias. Los demás casos de límites exactos son P05, P12, P16, P18, E02, E08, E09, E12 y E22–E23 (DSCR).

## D. Consecuencias que conviene confirmar

1. **Con 30 % de máximo y el estrés por defecto (ingreso −20 %), cualquier persona con cuotas desde 24 % del ingreso queda «Condicionado» solo por el estrés** (24 % ÷ 0,8 = 30 %). Es coherente con tu decisión, pero hace que «Favorable» exija cuotas menores de 24 %. Si te parece demasiado estricto, lo que se toca es el estrés (por ejemplo −10 %), no el 30 %.
2. **La regla de frontera alcanza a meses de ingreso, score, años de RUC, razón corriente, margen neto, cobertura de intereses y DSCR**: exactamente 6 meses, 650 de score o 3 años de RUC quedan en atención. **Confirmado por el analista (5-nov-2026): se mantiene general.**
3. **La banda superior es inclusiva**: cuotas de exactamente 50 % siguen en atención; 50,1 % es «no cumple».
4. **Endeudamiento, razón corriente, margen y cobertura no tienen banda de atención** más allá del valor exacto del límite: a un lado cumple o no cumple. El DSCR y los años de RUC sí tienen una banda intermedia.

## E. Cómo se verificó

Los 53 casos se calcularon con fórmulas de Excel recalculadas por LibreOffice (`docs/casos-de-referencia.xlsx`, con comparaciones a 9 decimales para que la coma flotante no decida un límite) y se comparan con el motor en las pruebas (186 pruebas en total). Ambos los escribió el mismo autor (Claude): **el control real es el recálculo manual de la sección C**.

## F. Criterio de las decisiones delegadas

- **Meses 6 / 3, score 650 / 300, RUC 3 / 1:** se conservan porque salen de requisitos publicados por entidades concretas (o de referencias de prensa, en el score, que además es opcional). Cambiarlos sin respaldo sería menos defendible que dejarlos.
- **Razón corriente 1,0, margen neto 0 %, cobertura de intereses 1,0:** son convenciones de piso. La exigencia real la pone el DSCR (1,2) y el endeudamiento (70 %), que ya son más estrictos; subir también estos tres duplicaría el rigor sin base. Con la regla de frontera, cumplir exige superar el piso.
- **Escenarios moderado (−10 % / +10 %) y severo (−25 % / +20 %):** solo informan; no cambian el nivel.
- **Estrés por defecto (−20 % / +0 %):** se mantiene la decisión del analista; es editable por la persona.
- **Control:** el recálculo lo hizo el mismo autor del motor; no sustituye una revisión humana. Los umbrales no son normas oficiales y así se dice en la página de Metodología.
