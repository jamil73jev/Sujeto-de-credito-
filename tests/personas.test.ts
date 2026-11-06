import { describe, expect, it } from "vitest";

import { estimarPersona, validarPersona, type EntradaPersona } from "@/lib/personas";

const base: EntradaPersona = {
  edad: 35,
  tipoIngreso: "dependencia",
  mesesIngresoEstable: 24,
  ingresoMensual: 1500,
  cuotasMensualesActuales: 100,
  cuotaNuevaEstimada: 200,
  scoreConocido: 700,
  moraActual: "no",
};

describe("estimarPersona", () => {
  it("perfil sólido => favorable", () => {
    const r = estimarPersona(base);
    expect(r.nivel).toBe("favorable");
    expect(r.ratioCuotasPct).toBeCloseTo(20, 6);
    expect(r.factores.some((f) => f.estado === "atencion" || f.estado === "no_cumple")).toBe(false);
    // Sin gastos ni documentos declarados, esos factores quedan "sin dato" (no inventan resultado).
    expect(r.factores.find((f) => f.id === "ingreso_disponible")?.estado).toBe("sin_dato");
    expect(r.factores.find((f) => f.id === "documentos")?.estado).toBe("sin_dato");
    expect(r.ingresoDisponible).toBeNull();
  });

  it("agrupa los factores en dimensiones, no en un puntaje único", () => {
    const dims = new Set(estimarPersona(base).factores.map((f) => f.dimension));
    expect([...dims].sort()).toEqual(["capacidad_pago", "documentos", "elegibilidad", "historial", "resiliencia"]);
  });

  it("ingreso disponible: positivo => cumple; negativo => débil", () => {
    const bien = estimarPersona({ ...base, gastosEsenciales: 800 });
    expect(bien.ingresoDisponible).toBeCloseTo(1500 - 800 - 300, 6);
    expect(bien.factores.find((f) => f.id === "ingreso_disponible")?.estado).toBe("cumple");
    const mal = estimarPersona({ ...base, gastosEsenciales: 1300 });
    expect(mal.ingresoDisponible).toBeCloseTo(-100, 6);
    expect(mal.nivel).toBe("debil");
  });

  it("prueba de estrés: una baja de ingreso fuerte lleva a 'condicionado', nunca a 'débil'", () => {
    const r = estimarPersona({ ...base, estres: { reduccionIngresoPct: 20, aumentoCuotasPct: 0 } });
    // cuotas 300 sobre ingreso 1.200 = 25 %, por debajo del máximo de 30 %
    expect(r.factores.find((f) => f.id === "resiliencia")?.estado).toBe("cumple");
    const duro = estimarPersona({ ...base, estres: { reduccionIngresoPct: 60, aumentoCuotasPct: 0 } });
    expect(duro.factores.find((f) => f.id === "resiliencia")?.estado).toBe("atencion");
    expect(duro.nivel).toBe("condicionado");
    expect(duro.ratioEstresPct).toBeCloseTo(50, 6);
  });

  it("estrés justo en el máximo: atención (regla de frontera)", () => {
    // ingreso 1.500 con caída de 33,33 %: 300 / 1.000 = 30 %
    const r = estimarPersona({ ...base, estres: { reduccionIngresoPct: 100 / 3, aumentoCuotasPct: 0 } });
    expect(r.ratioEstresPct).toBeCloseTo(30, 6);
    expect(r.factores.find((f) => f.id === "resiliencia")?.estado).toBe("atencion");
  });

  it("estrés con ingreso del escenario en cero: atención, sin dividir por cero", () => {
    const r = estimarPersona({ ...base, estres: { reduccionIngresoPct: 100, aumentoCuotasPct: 0 } });
    expect(r.ratioEstresPct).toBeNull();
    expect(r.factores.find((f) => f.id === "resiliencia")?.estado).toBe("atencion");
  });

  it("documentos: informan, pero no cambian el nivel", () => {
    expect(estimarPersona({ ...base, documentos: { listos: 5, total: 5 } }).nivel).toBe("favorable");
    const r = estimarPersona({ ...base, documentos: { listos: 3, total: 5 } });
    const f = r.factores.find((x) => x.id === "documentos");
    expect(f?.estado).toBe("atencion");
    expect(f?.soloInforma).toBe(true);
    expect(r.nivel).toBe("favorable");
    // Con otro criterio en atención el nivel sí baja, pero por ese criterio y no por los documentos.
    expect(estimarPersona({ ...base, mesesIngresoEstable: 4, documentos: { listos: 3, total: 5 } }).nivel).toBe("condicionado");
  });

  it("regla de frontera: cuotas exactamente en el máximo (30 %) quedan en atención; 29,9 % cumplen", () => {
    const justo = estimarPersona({ ...base, ingresoMensual: 1000, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 200 });
    expect(justo.factores.find((f) => f.id === "endeudamiento")?.estado).toBe("atencion");
    const bajo = estimarPersona({ ...base, ingresoMensual: 1000, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 199 });
    expect(bajo.factores.find((f) => f.id === "endeudamiento")?.estado).toBe("cumple");
  });

  it("zona de atención: hasta 50 % (30 % + 20 puntos) es atención; más allá, no cumple", () => {
    const e = (nueva: number) =>
      estimarPersona({ ...base, ingresoMensual: 1000, cuotasMensualesActuales: 0, cuotaNuevaEstimada: nueva }).factores.find((f) => f.id === "endeudamiento")?.estado;
    expect(e(500)).toBe("atencion");
    expect(e(501)).toBe("no_cumple");
  });

  it("no depende de la coma flotante: 0,1 + 0,2 frente a 0,3", () => {
    const r = estimarPersona({ ...base, ingresoMensual: 1, cuotasMensualesActuales: 0.1, cuotaNuevaEstimada: 0.2 });
    expect(r.factores.find((f) => f.id === "endeudamiento")?.estado).toBe("atencion");
  });

  it("score exactamente en el favorable (650): atención; 651: cumple", () => {
    expect(estimarPersona({ ...base, scoreConocido: 650 }).factores.find((f) => f.id === "score")?.estado).toBe("atencion");
    expect(estimarPersona({ ...base, scoreConocido: 651 }).factores.find((f) => f.id === "score")?.estado).toBe("cumple");
  });

  it("valida los campos opcionales cuando vienen", () => {
    expect(estimarPersona({ ...base, gastosEsenciales: -5 }).errores.map((e) => e.campo)).toContain("gastosEsenciales");
    expect(estimarPersona({ ...base, documentos: { listos: 6, total: 5 } }).errores.map((e) => e.campo)).toContain("documentos");
    expect(
      estimarPersona({ ...base, estres: { reduccionIngresoPct: 120, aumentoCuotasPct: 0 } }).errores.map((e) => e.campo),
    ).toContain("estresReduccionIngreso");
  });

  it("sin score no impide ser favorable, pero lo marca sin_dato", () => {
    const r = estimarPersona({ ...base, scoreConocido: null });
    expect(r.nivel).toBe("favorable");
    expect(r.factores.find((f) => f.id === "score")?.estado).toBe("sin_dato");
  });

  it("mora declarada => débil", () => {
    expect(estimarPersona({ ...base, moraActual: "si" }).nivel).toBe("debil");
  });

  it("no saber si hay mora => condicionado", () => {
    expect(estimarPersona({ ...base, moraActual: "no_se" }).nivel).toBe("condicionado");
  });

  it("menor de edad => débil", () => {
    expect(estimarPersona({ ...base, edad: 17 }).nivel).toBe("debil");
  });

  it("score bajo 300 => débil; entre 300 y 649 => condicionado", () => {
    expect(estimarPersona({ ...base, scoreConocido: 250 }).nivel).toBe("debil");
    expect(estimarPersona({ ...base, scoreConocido: 500 }).nivel).toBe("condicionado");
  });

  it("endeudamiento: en el margen => condicionado; muy por encima => débil", () => {
    // 45 % (entre 40 y 50)
    expect(estimarPersona({ ...base, cuotasMensualesActuales: 475, cuotaNuevaEstimada: 200 }).nivel).toBe("condicionado");
    // 80 %
    expect(estimarPersona({ ...base, cuotasMensualesActuales: 1000, cuotaNuevaEstimada: 200 }).nivel).toBe("debil");
  });

  it("antigüedad: independiente exige menos meses que dependiente", () => {
    const dependiente = estimarPersona({ ...base, mesesIngresoEstable: 4 });
    const independiente = estimarPersona({ ...base, tipoIngreso: "independiente", mesesIngresoEstable: 4 });
    expect(dependiente.factores.find((f) => f.id === "estabilidad")?.estado).toBe("atencion");
    expect(independiente.factores.find((f) => f.id === "estabilidad")?.estado).toBe("cumple");
  });

  it("los parámetros son editables", () => {
    const r = estimarPersona(
      { ...base, cuotasMensualesActuales: 475, cuotaNuevaEstimada: 200, estres: { reduccionIngresoPct: 0, aumentoCuotasPct: 0 } },
      {
        edadMinima: 18,
        mesesMinimosDependencia: 6,
        mesesMinimosIndependiente: 3,
        maxCuotasSobreIngresoPct: 50,
        margenAtencionPct: 10,
        scoreFavorable: 650,
        scoreRechazoFrecuente: 300,
        estresReduccionIngresoPct: 20,
        estresAumentoCuotasPct: 0,
      },
    );
    expect(r.nivel).toBe("favorable");
  });

  it("datos inválidos => insuficiente con errores por campo", () => {
    const r = estimarPersona({ ...base, ingresoMensual: 0, edad: Number.NaN, scoreConocido: 1500 });
    expect(r.nivel).toBe("insuficiente");
    expect(r.errores.map((e) => e.campo).sort()).toEqual(["edad", "ingresoMensual", "scoreConocido"]);
  });
});

describe("validarPersona", () => {
  it("marca campos faltantes como requeridos", () => {
    const errores = validarPersona({});
    expect(errores.find((e) => e.campo === "edad")?.codigo).toBe("campo_requerido");
    expect(errores.find((e) => e.campo === "tipoIngreso")?.codigo).toBe("campo_requerido");
  });

  it("acepta un score nulo", () => {
    expect(validarPersona({ ...base, scoreConocido: null })).toEqual([]);
  });
});
