"""Lee el libro recalculado y escribe tests/casos/{personas,empresas}.json (entradas + resultados esperados de la hoja)."""
import json, sys, pathlib
from openpyxl import load_workbook
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from casos import PERSONAS, EMPRESAS

wb = load_workbook(sys.argv[1], data_only=True)
num = lambda v: None if v in (None, "") else float(v)

ws = wb["Personas"]
filas = {r[0]: r for r in ws.iter_rows(min_row=2, values_only=True)}
personas = []
for c in PERSONAS:
    r = filas[c["id"]]
    estados = r[31].split("|") if r[31] and "|" in str(r[31]) else []
    nombres = ["edad", "estabilidad", "endeudamiento", "ingreso_disponible", "mora", "score", "resiliencia", "documentos"]
    personas.append({
        "id": c["id"], "descripcion": c["desc"],
        "entrada": {"edad": c["edad"], "tipoIngreso": c["tipoIngreso"], "mesesIngresoEstable": c["meses"], "ingresoMensual": c["ingreso"],
                    "gastosEsenciales": c["gastos"], "cuotasMensualesActuales": c["cuotasActuales"], "cuotaNuevaEstimada": c["cuotaNueva"],
                    "scoreConocido": c["score"], "moraActual": c["mora"],
                    "estres": {"reduccionIngresoPct": c["estresRed"], "aumentoCuotasPct": c["estresAum"]},
                    "documentos": None if c["docsTotal"] is None else {"listos": c["docsListos"], "total": c["docsTotal"]}},
        "esperado": {"nivel": r[32], "ratioCuotasPct": num(r[19]) if r[15] == 1 else None,
                     "ingresoDisponible": num(r[21]) if r[15] == 1 else None,
                     "ratioEstresPct": num(r[27]) if r[15] == 1 else None,
                     "estados": dict(zip(nombres, estados)) if r[15] == 1 else {}},
    })
json.dump(personas, open("tests/casos/personas.json", "w"), ensure_ascii=False, indent=1)

we = wb["Empresas"]
filas = {r[0]: r for r in we.iter_rows(min_row=2, values_only=True)}
empresas = []
for c in EMPRESAS:
    r = filas[c["id"]]
    valido = r[23] == 1
    estados = r[44].split("|") if valido else []
    nombres = ["razon_corriente", "endeudamiento", "patrimonio", "margen_neto", "cobertura_intereses", "antiguedad_ruc", "tributario", "patronales", "estados_financieros", "dscr"]
    anterior = None if c["vant"] is None else {"ventasAnuales": c["vant"], "utilidadNeta": c["unant"], "activoTotal": c["atant"], "patrimonio": c["patant"]}
    empresas.append({
        "id": c["id"], "descripcion": c["desc"],
        "entrada": {"ventasAnuales": c["ventas"], "activoCorriente": c["ac"], "pasivoCorriente": c["pc"], "inventarios": c["inv"], "activoTotal": c["at"],
                    "pasivoTotal": c["pt"], "patrimonio": c["pat"], "utilidadNeta": c["un"], "utilidadOperativa": c["uo"], "gastosFinancieros": c["gf"],
                    "cuentasPorCobrar": c["cxc"], "flujoDisponible": c["flujo"], "servicioDeuda": c["servicio"], "aniosRuc": c["ruc"],
                    "cumplimientoTributario": c["trib"], "obligacionesPatronales": c["patr"], "estadosFinancierosPresentados": c["ef"], "anterior": anterior},
        "esperado": {"nivel": r[45],
                     "ratios": ({"razon_corriente": num(r[24]), "endeudamiento": num(r[25]), "margen_neto": num(r[26]), "cobertura_intereses": num(r[27]),
                                 "dscr": num(r[28]), "roa": num(r[29]), "roe": num(r[30]), "crecimiento_ventas": num(r[31]), "variacion_margen": num(r[32]),
                                 "roa_promedio": num(r[33]), "roe_promedio": num(r[34])} if valido else {}),
                     "estados": dict(zip(nombres, estados)) if valido else {}},
    })
json.dump(empresas, open("tests/casos/empresas.json", "w"), ensure_ascii=False, indent=1)
print(len(personas), "personas;", len(empresas), "empresas")
