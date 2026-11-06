"""
Genera docs/casos-de-referencia.xlsx con fórmulas de hoja de cálculo que reimplementan la metodología v1.1
de forma INDEPENDIENTE del código del sitio. Luego se recalcula con LibreOffice y recalcular.py exporta
los resultados a tests/casos/*.json, que las pruebas comparan con el motor.
Uso: python3 scripts/casos/generar_xlsx.py
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter as L
from casos import PERSONAS, EMPRESAS

wb = Workbook()

# ---------- Parámetros (se reingresan a mano desde la tabla de la metodología) ----------
pa = wb.active
pa.title = "Parametros"
params = [
    ("Edad mínima", 18), ("Meses mínimos, dependencia", 6), ("Meses mínimos, independiente", 3),
    ("Máximo cuotas / ingreso (%)", 30), ("Margen de atención (pp)", 20), ("Score favorable", 650), ("Score de rechazo frecuente", 300),
    ("Razón corriente mínima", 1), ("Endeudamiento máximo (%)", 70), ("Margen neto mínimo (%)", 0), ("Cobertura de intereses mínima", 1),
    ("Años de RUC sólidos", 3), ("Años de RUC mínimos", 1), ("Tolerancia del balance", 0.05),
    ("DSCR mínimo", 1.2), ("Frontera: 1 = el valor exacto del límite es atención", 1),
]
pa.append(["Parámetro", "Valor"])
for n, v in params:
    pa.append([n, v])
P_ = {n: f"Parametros!$B${i+2}" for i, (n, _) in enumerate(params)}

FR = P_["Frontera: 1 = el valor exacto del límite es atención"]
R9 = lambda x: f"ROUND({x},9)"

def minimo(v, m, bajo='"no_cumple"'):
    """Más es mejor: por encima cumple; justo en el mínimo, atención si rige la frontera; por debajo, `bajo`."""
    return f'IF({R9(v)}>{R9(m)},"cumple",IF({R9(v)}={R9(m)},IF({FR}=1,"atencion","cumple"),{bajo}))'

def maximo(v, m, margen="0"):
    """Menos es mejor: por debajo cumple; justo en el máximo, atención si rige la frontera; hasta máximo+margen, atención."""
    return f'IF({R9(v)}<{R9(m)},"cumple",IF({R9(v)}={R9(m)},IF({FR}=1,"atencion","cumple"),IF({R9(v)}<={R9(m + "+" + margen)},"atencion","no_cumple")))'

azul = PatternFill("solid", fgColor="E4EDFF")
entrada = PatternFill("solid", fgColor="FFF7D6")
def encabezados(ws, cols, entradas):
    ws.append(cols)
    for i, c in enumerate(cols, 1):
        cel = ws.cell(row=1, column=i)
        cel.font = Font(bold=True)
        cel.fill = entrada if i <= entradas else azul
        cel.alignment = Alignment(wrap_text=True, vertical="top")
    ws.freeze_panes = "C2"

# ---------- Personas ----------
ws = wb.create_sheet("Personas")
cols = ["id", "descripción", "edad", "tipo de ingreso", "meses de ingreso", "ingreso", "gastos", "cuotas actuales", "cuota nueva", "score", "mora",
        "estrés: caída ingreso %", "estrés: alza cuotas %", "docs listos", "docs total",
        "válido", "edad", "estabilidad", "cuotas totales", "cuotas / ingreso %", "cuotas", "disponible", "disponible (estado)", "mora (estado)", "score (estado)",
        "ingreso estrés", "cuotas estrés", "cuotas estrés / ingreso estrés %", "disponible estrés", "resiliencia", "documentos", "estados", "NIVEL", "estados que cuentan para el nivel"]
encabezados(ws, cols, 15)
for i, c in enumerate(PERSONAS, 2):
    ws.append([c["id"], c["desc"], c["edad"], c["tipoIngreso"], c["meses"], c["ingreso"], c["gastos"], c["cuotasActuales"], c["cuotaNueva"], c["score"], c["mora"],
               c["estresRed"], c["estresAum"], c["docsListos"], c["docsTotal"]])
    r = i
    f = {}
    f["P"] = (f'=IF(AND(ISNUMBER(C{r}),C{r}>=0,C{r}<=120,ISNUMBER(E{r}),E{r}>=0,E{r}<=1200,ISNUMBER(F{r}),F{r}>0,ISNUMBER(H{r}),H{r}>=0,'
              f'ISNUMBER(I{r}),I{r}>=0,OR(D{r}="dependencia",D{r}="independiente"),OR(K{r}="no",K{r}="si",K{r}="no_se"),'
              f'OR(J{r}="",AND(ISNUMBER(J{r}),J{r}=INT(J{r}),J{r}>=1,J{r}<=999)),OR(G{r}="",AND(ISNUMBER(G{r}),G{r}>=0)),'
              f'ISNUMBER(L{r}),L{r}>=0,L{r}<=100,ISNUMBER(M{r}),M{r}>=0,OR(O{r}="",AND(ISNUMBER(N{r}),N{r}>=0,ISNUMBER(O{r}),O{r}>=N{r}))),1,0)')
    f["Q"] = f'=IF(C{r}>={P_["Edad mínima"]},"cumple","no_cumple")'
    f["R"] = f'=IF(E{r}>0,' + minimo(f"E{r}", f'IF(D{r}="dependencia",{P_["Meses mínimos, dependencia"]},{P_["Meses mínimos, independiente"]})', '"atencion"') + ',"no_cumple")'
    f["S"] = f"=H{r}+I{r}"
    f["T"] = f"=S{r}/F{r}*100"
    f["U"] = "=" + maximo(f"T{r}", P_["Máximo cuotas / ingreso (%)"], P_["Margen de atención (pp)"])
    f["V"] = f'=IF(G{r}="","",F{r}-G{r}-S{r})'
    f["W"] = f'=IF(G{r}="","sin_dato",' + minimo(f"V{r}", "0") + ')'
    f["X"] = f'=IF(K{r}="no","cumple",IF(K{r}="si","no_cumple","atencion"))'
    f["Y"] = f'=IF(J{r}="","sin_dato",IF(J{r}>={P_["Score de rechazo frecuente"]},' + minimo(f"J{r}", P_["Score favorable"], '"atencion"') + ',"no_cumple"))'
    f["Z"] = f"=F{r}*(1-L{r}/100)"
    f["AA"] = f"=S{r}*(1+M{r}/100)"
    f["AB"] = f'=IF(Z{r}>0,AA{r}/Z{r}*100,"")'
    f["AC"] = f'=IF(G{r}="","",Z{r}-G{r}-AA{r})'
    f["AD"] = (f'=IF(IF(Z{r}>0,AND(' + maximo(f"AB{r}", P_["Máximo cuotas / ingreso (%)"]) + f'="cumple",OR(G{r}="",' + minimo(f"AC{r}", "0") + f'="cumple")),FALSE),"cumple","atencion")')
    f["AE"] = f'=IF(OR(O{r}="",O{r}=0),"sin_dato",IF(N{r}>=O{r},"cumple","atencion"))'
    f["AF"] = f'=Q{r}&"|"&R{r}&"|"&U{r}&"|"&W{r}&"|"&X{r}&"|"&Y{r}&"|"&AD{r}&"|"&AE{r}'
    f["AH"] = f'=Q{r}&"|"&R{r}&"|"&U{r}&"|"&W{r}&"|"&X{r}&"|"&Y{r}&"|"&AD{r}'
    f["AG"] = f'=IF(P{r}=0,"insuficiente",IF(ISNUMBER(SEARCH("no_cumple",AH{r})),"debil",IF(ISNUMBER(SEARCH("atencion",AH{r})),"condicionado","favorable")))'
    for col, formula in f.items():
        ws[f"{col}{r}"] = formula
ws.column_dimensions["B"].width = 46

# ---------- Empresas ----------
we = wb.create_sheet("Empresas")
ecols = ["id", "descripción", "ventas", "activo corriente", "pasivo corriente", "inventarios", "activo total", "pasivo total", "patrimonio", "utilidad neta",
         "utilidad operativa", "gastos financieros", "cuentas por cobrar", "flujo disponible", "servicio de deuda", "años de RUC", "SRI", "IESS", "estados fin.",
         "ventas año ant.", "utilidad año ant.", "activo año ant.", "patrimonio año ant.",
         "válido", "razón corriente", "endeudamiento %", "margen neto %", "cobertura intereses", "DSCR", "ROA %", "ROE %", "crecimiento ventas %", "variación margen pp",
         "ROA promedio %", "ROE promedio %",
         "liquidez", "solvencia", "patrimonio (estado)", "rentabilidad", "cobertura (estado)", "RUC (estado)", "SRI (estado)", "IESS (estado)", "EF (estado)", "estados", "NIVEL", "DSCR (estado)"]
encabezados(we, ecols, 23)
conf = lambda cell: f'IF({cell}="si","cumple",IF({cell}="no","no_cumple","atencion"))'
for i, c in enumerate(EMPRESAS, 2):
    r = i
    we.append([c["id"], c["desc"], c["ventas"], c["ac"], c["pc"], c["inv"], c["at"], c["pt"], c["pat"], c["un"], c["uo"], c["gf"], c["cxc"], c["flujo"],
               c["servicio"], c["ruc"], c["trib"], c["patr"], c["ef"], c["vant"], c["unant"], c["atant"], c["patant"]])
    F = {}
    num = lambda col: f"ISNUMBER({col}{r})"
    F["X"] = (f'=IF(AND({num("C")},C{r}>0,{num("D")},D{r}>=0,{num("E")},E{r}>=0,OR(F{r}="",AND({num("F")},F{r}>=0)),{num("G")},G{r}>0,{num("H")},H{r}>=0,'
              f'{num("I")},{num("J")},OR(K{r}="",{num("K")}),OR(L{r}="",AND({num("L")},L{r}>=0)),OR(M{r}="",AND({num("M")},M{r}>=0)),OR(N{r}="",{num("N")}),'
              f'OR(O{r}="",AND({num("O")},O{r}>=0)),{num("P")},P{r}>=0,OR(Q{r}="si",Q{r}="no",Q{r}="no_se"),OR(R{r}="si",R{r}="no",R{r}="no_se"),'
              f'OR(S{r}="si",S{r}="no",S{r}="no_se"),'
              f'OR(AND(T{r}="",U{r}="",V{r}="",W{r}=""),AND({num("T")},T{r}>0,{num("U")},{num("V")},V{r}>0,{num("W")}))),'
              f'IF(ABS(G{r}-(H{r}+I{r}))/G{r}<={P_["Tolerancia del balance"]},1,0),0)')
    F["Y"] = f'=IF(E{r}>0,D{r}/E{r},"")'
    F["Z"] = f"=H{r}/G{r}*100"
    F["AA"] = f"=J{r}/C{r}*100"
    F["AB"] = f'=IF(OR(K{r}="",L{r}=""),"",IF(L{r}>0,K{r}/L{r},""))'
    F["AC"] = f'=IF(OR(N{r}="",O{r}=""),"",IF(O{r}>0,N{r}/O{r},""))'
    F["AD"] = f"=J{r}/G{r}*100"
    F["AE"] = f'=IF(I{r}>0,J{r}/I{r}*100,"")'
    F["AF"] = f'=IF(T{r}="","",(C{r}/T{r}-1)*100)'
    F["AG"] = f'=IF(T{r}="","",AA{r}-U{r}/T{r}*100)'
    F["AH"] = f'=IF(T{r}="","",J{r}/((G{r}+V{r})/2)*100)'
    F["AI"] = f'=IF(T{r}="","",IF((I{r}+W{r})/2>0,J{r}/((I{r}+W{r})/2)*100,""))'
    F["AJ"] = f'=IF(Y{r}="","no_cumple",' + minimo(f"Y{r}", P_["Razón corriente mínima"]) + ')'
    F["AK"] = "=" + maximo(f"Z{r}", P_["Endeudamiento máximo (%)"])
    F["AL"] = f'=IF(I{r}>0,"cumple","no_cumple")'
    F["AM"] = "=" + minimo(f"AA{r}", P_["Margen neto mínimo (%)"])
    F["AN"] = f'=IF(AB{r}="","omitido",' + minimo(f"AB{r}", P_["Cobertura de intereses mínima"]) + ')'
    F["AO"] = f'=IF({R9(f"P{r}")}>={R9(P_["Años de RUC mínimos"])},' + minimo(f"P{r}", P_["Años de RUC sólidos"], '"atencion"') + ',"no_cumple")'
    F["AP"] = "=" + conf(f"Q{r}")
    F["AQ"] = "=" + conf(f"R{r}")
    F["AR"] = "=" + conf(f"S{r}")
    F["AU"] = f'=IF(AC{r}="","omitido",IF({R9(f"AC{r}")}>=1,' + minimo(f"AC{r}", P_["DSCR mínimo"], '"atencion"') + ',"no_cumple"))'
    F["AS"] = f'=AJ{r}&"|"&AK{r}&"|"&AL{r}&"|"&AM{r}&"|"&AN{r}&"|"&AO{r}&"|"&AP{r}&"|"&AQ{r}&"|"&AR{r}&"|"&AU{r}'
    F["AT"] = f'=IF(X{r}=0,"insuficiente",IF(ISNUMBER(SEARCH("no_cumple",AS{r})),"debil",IF(ISNUMBER(SEARCH("atencion",AS{r})),"condicionado","favorable")))'
    for col, formula in F.items():
        we[f"{col}{r}"] = formula
we.column_dimensions["B"].width = 46

# Corrección: encabezados de columnas calculadas = los de 'ecols' ya cubren hasta AT (46 columnas). Se verifica el alineamiento.
assert len(ecols) == 47, len(ecols)
assert L(47) == "AU"
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "docs/casos-de-referencia-sin-recalcular.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print("guardado", out)
