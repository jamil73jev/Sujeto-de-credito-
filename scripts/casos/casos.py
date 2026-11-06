"""Definición de los casos de referencia. Los datos de entrada son lo único que se comparte con el código del sitio."""

# Personas: edad, tipo, meses, ingreso, gastos, cuotas actuales, cuota nueva, score, mora, estrés ingreso %, estrés cuotas %, docs listos, docs total
P = lambda id, desc, edad, tipo, meses, ing, gas, cua, cun, score, mora, er=20, ec=0, dl=None, dt=None: dict(
    id=id, desc=desc, edad=edad, tipoIngreso=tipo, meses=meses, ingreso=ing, gastos=gas, cuotasActuales=cua,
    cuotaNueva=cun, score=score, mora=mora, estresRed=er, estresAum=ec, docsListos=dl, docsTotal=dt)

PERSONAS = [
    P("P01", "Perfil sano, dependencia, sin mora", 32, "dependencia", 24, 1500, 600, 100, 200, 700, "no", 20, 0, 3, 3),
    P("P02", "Perfil de ejemplo del sitio (sin docs ni score)", 32, "dependencia", 24, 900, 450, 120, 90, None, "no"),
    P("P03", "Cuotas exactamente en el máximo (30 %): límite = atención", 30, "dependencia", 12, 1000, 300, 200, 100, None, "no"),
    P("P04", "Cuotas en 29,9 % sin estrés (cumple)", 30, "dependencia", 12, 1000, 300, 200, 99, None, "no", 0, 0),
    P("P05", "Cuotas exactamente en 50 % (atención, límite superior)", 30, "dependencia", 12, 1000, 200, 300, 200, None, "no"),
    P("P06", "Cuotas en 50,1 % (no cumple)", 30, "dependencia", 12, 1000, 200, 300, 201, None, "no"),
    P("P07", "Menor de edad", 17, "dependencia", 24, 1500, 300, 0, 100, None, "no"),
    P("P08", "Justo 18 años", 18, "dependencia", 12, 1200, 300, 0, 100, None, "no"),
    P("P09", "Dependencia con 6 meses exactos: límite = atención", 25, "dependencia", 6, 1200, 400, 0, 150, None, "no"),
    P("P10", "Dependencia con 5 meses (atención)", 25, "dependencia", 5, 1200, 400, 0, 150, None, "no"),
    P("P11", "Dependencia con 0 meses (no cumple)", 25, "dependencia", 0, 1200, 400, 0, 150, None, "no"),
    P("P12", "Independiente con 3 meses exactos: límite = atención", 40, "independiente", 3, 1500, 500, 0, 200, None, "no"),
    P("P13", "Independiente con 2 meses (atención)", 40, "independiente", 2, 1500, 500, 0, 200, None, "no"),
    P("P14", "Mora declarada", 35, "dependencia", 30, 2000, 700, 100, 200, 700, "si"),
    P("P15", "No sabe si tiene mora", 35, "dependencia", 30, 2000, 700, 100, 200, 700, "no_se"),
    P("P16", "Score exactamente 650: límite = atención", 35, "dependencia", 30, 2000, 700, 100, 200, 650, "no"),
    P("P17", "Score 651 (cumple)", 35, "dependencia", 30, 2000, 700, 100, 200, 651, "no"),
    P("P18", "Score exactamente 300 (atención)", 35, "dependencia", 30, 2000, 700, 100, 200, 300, "no"),
    P("P19", "Score 299 (no cumple)", 35, "dependencia", 30, 2000, 700, 100, 200, 299, "no"),
    P("P20", "Gastos y cuotas superan el ingreso", 35, "dependencia", 30, 1000, 750, 100, 200, None, "no"),
    P("P21", "Ingreso disponible exactamente cero: límite = atención", 35, "dependencia", 30, 2000, 1700, 100, 200, None, "no"),
    P("P22", "Estrés: ingreso -20 % lleva las cuotas sobre el máximo (atención)", 35, "dependencia", 30, 1000, 300, 100, 150, None, "no", 20, 0),
    P("P23", "Estrés con cuotas +30 % e ingreso -10 % (resiste)", 35, "dependencia", 30, 2000, 500, 200, 200, None, "no", 10, 30),
    P("P24", "Estrés del 100 % del ingreso", 35, "dependencia", 30, 2000, 500, 200, 200, None, "no", 100, 0),
    P("P25", "Documentos incompletos (2 de 3): solo informa, no cambia el nivel", 35, "dependencia", 30, 1800, 500, 100, 200, None, "no", 20, 0, 2, 3),
    P("P26", "Documentos completos (3 de 3)", 35, "dependencia", 30, 1800, 500, 100, 200, None, "no", 20, 0, 3, 3),
    P("P27", "Sin gastos declarados", 35, "dependencia", 30, 1800, None, 100, 200, 680, "no"),
    P("P28", "Ingreso cero (datos insuficientes)", 35, "dependencia", 30, 0, 100, 0, 100, None, "no"),
    P("P29", "Score fuera de rango (1000)", 35, "dependencia", 30, 1800, 500, 100, 200, 1000, "no"),
    P("P30", "Independiente, perfil débil por varios criterios", 22, "independiente", 1, 600, 500, 150, 200, 250, "si"),
]

# Empresas: ver el orden de columnas en generar_xlsx.py
def E(id, desc, **k):
    base = dict(ventas=480000, ac=120000, pc=80000, inv=30000, at=260000, pt=150000, pat=110000, un=24000, uo=38000, gf=9000,
                cxc=40000, flujo=45000, servicio=30000, ruc=5, trib="si", patr="si", ef="si", vant=None, unant=None, atant=None, patant=None)
    base.update(k)
    return dict(id=id, desc=desc, **base)

EMPRESAS = [
    E("E01", "Pyme de ejemplo del sitio"),
    E("E02", "Razón corriente exactamente 1,0: límite = atención", ac=80000, pc=80000),
    E("E03", "Razón corriente 0,99", ac=79200, pc=80000),
    E("E04", "Endeudamiento exactamente 70 %: límite = atención", at=250000, pt=175000, pat=75000),
    E("E05", "Endeudamiento 70,4 % (no cumple)", at=250000, pt=176000, pat=74000),
    E("E06", "Patrimonio negativo con balance cuadrado", at=260000, pt=300000, pat=-40000),
    E("E07", "Pérdida del ejercicio", un=-12000),
    E("E08", "Margen neto exactamente cero: límite = atención", un=0),
    E("E09", "Cobertura de intereses exactamente 1,0: límite = atención", uo=9000, gf=9000),
    E("E10", "Cobertura de intereses 0,5", uo=4500, gf=9000),
    E("E11", "Sin gastos financieros (cobertura no calculable)", gf=0),
    E("E12", "RUC de 3 años exactos: límite = atención", ruc=3),
    E("E13", "RUC de 2 años (atención)", ruc=2),
    E("E14", "RUC de 0,5 años (no cumple)", ruc=0.5),
    E("E15", "Deudas con el SRI", trib="no"),
    E("E16", "No sabe si está al día con el IESS", patr="no_se"),
    E("E17", "Balance que no cuadra (datos insuficientes)", at=260000, pt=150000, pat=60000),
    E("E18", "Con año anterior: ventas y utilidad en alza", vant=400000, unant=16000, atant=240000, patant=100000),
    E("E19", "Con año anterior: ventas en caída y margen menor", vant=600000, unant=42000, atant=280000, patant=130000),
    E("E20", "Sin inventarios ni flujo (opcionales vacíos)", inv=None, uo=None, gf=None, cxc=None, flujo=None, servicio=None),
    E("E21", "DSCR exactamente 1,2: límite = atención", flujo=36000, servicio=30000),
    E("E22", "DSCR 1,1 (atención)", flujo=33000, servicio=30000),
    E("E23", "DSCR 0,9 (no cumple)", flujo=27000, servicio=30000),
]
