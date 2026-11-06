import { describe, expect, it } from "vitest";

import { escenariosPersona } from "../src/lib/escenarios";
import {
  construirInforme,
  documentosEmpresa,
  documentosPersona,
  escenariosPersonaInforme,
  fechaLarga,
  fichasEmpresa,
  fichasPersona,
  folioInforme,
  recomendacionesPriorizadas,
  reglasAplicadas,
} from "../src/lib/informe";
import { METODOLOGIA, REGLAS_METODOLOGIA } from "../src/lib/metodologia";
import { formatoMoneda, formatoPct } from "../src/lib/numeros";
import { estimarEmpresa, type EntradaEmpresa } from "../src/lib/empresas";
import { estimarPersona, type EntradaPersona } from "../src/lib/personas";
import type { Factor } from "../src/lib/tipos";

const persona: EntradaPersona = {
  edad: 30,
  tipoIngreso: "dependencia",
  mesesIngresoEstable: 12,
  ingresoMensual: 1000,
  gastosEsenciales: 750,
  cuotasMensualesActuales: 100,
  cuotaNuevaEstimada: 200,
  scoreConocido: null,
  moraActual: "no",
  estres: { reduccionIngresoPct: 20, aumentoCuotasPct: 0 },
  documentos: { listos: 1, total: 3 },
};

const declarados = [
  { etiqueta: "Edad", valor: "30 años" },
  { etiqueta: "Ingreso mensual", valor: "$1.000,00" },
];

describe("folio", () => {
  it("tiene el formato P-AAAAMMDD-XXXXXX y no cambia con los mismos datos", () => {
    const a = folioInforme("persona", "2026-11-05", declarados);
    expect(a).toMatch(/^P-20261105-[0-9A-F]{6}$/);
    expect(folioInforme("persona", "2026-11-05", declarados)).toBe(a);
  });

  it("cambia si cambia un dato, el tipo o la fecha", () => {
    const base = folioInforme("persona", "2026-11-05", declarados);
    expect(folioInforme("persona", "2026-11-05", [{ etiqueta: "Edad", valor: "31 años" }, declarados[1]!])).not.toBe(base);
    expect(folioInforme("empresa", "2026-11-05", declarados)).not.toBe(base);
    expect(folioInforme("persona", "2026-11-06", declarados)).not.toBe(base);
  });

  it("las empresas usan el prefijo E", () => {
    expect(folioInforme("empresa", "2026-11-05", declarados)).toMatch(/^E-/);
  });
});

describe("fechaLarga", () => {
  it("escribe la fecha en español", () => {
    expect(fechaLarga("2026-11-05")).toBe("5 de noviembre de 2026");
    expect(fechaLarga("2027-01-31")).toBe("31 de enero de 2027");
  });
});

describe("recomendaciones priorizadas", () => {
  const f = (id: string, estado: Factor["estado"], recomendacion: string | null): Factor => ({
    id,
    dimension: "capacidad_pago",
    etiqueta: id,
    estado,
    detalle: "",
    recomendacion,
  });

  it("ordena primero lo que no cumple, luego atención y luego datos faltantes", () => {
    const r = recomendacionesPriorizadas([f("a", "sin_dato", "completa"), f("b", "atencion", "revisa"), f("c", "no_cumple", "corrige"), f("d", "cumple", "no debe salir")]);
    expect(r.map((x) => x.criterio)).toEqual(["c", "b", "a"]);
    expect(r.map((x) => x.prioridad)).toEqual([1, 2, 3]);
  });

  it("omite los criterios sin recomendación", () => {
    expect(recomendacionesPriorizadas([f("a", "no_cumple", null)])).toEqual([]);
  });
});

describe("informe de persona", () => {
  const res = estimarPersona(persona);
  const esc = escenariosPersona({ ingresoMensual: 1000, gastosEsenciales: 750, cuotasMensualesActuales: 100, cuotaNuevaEstimada: 200 });
  const informe = construirInforme({
    tipo: "persona",
    fechaISO: "2026-11-05",
    nivel: res.nivel === "insuficiente" ? "debil" : res.nivel,
    factores: res.factores,
    declarados,
    cifras: [{ etiqueta: "Cuotas sobre ingreso", valor: "30,0 %", formula: "x" }],
    escenarios: escenariosPersonaInforme(esc.escenarios, esc.sensibilidad, formatoMoneda, formatoPct),
    documentos: documentosPersona({ cedula: true }, ["cedula", "ingresos-comprobables", "respaldos-ingresos"]),
    fichas: fichasPersona(),
  });

  it("lleva la versión de la metodología, el estado y el aviso completo", () => {
    expect(informe.version).toBe(METODOLOGIA.version);
    expect(informe.estadoMetodologia).toBe(METODOLOGIA.estado);
    expect(informe.aviso).toContain("No constituye un reporte oficial");
  });

  it("el nivel coincide con el del motor y trae su texto", () => {
    expect(informe.nivel).toBe("debil");
    expect(informe.tituloNivel.length).toBeGreaterThan(0);
  });

  it("incluye los tres escenarios y la sensibilidad", () => {
    expect(informe.escenarios).toHaveLength(3);
    expect(informe.sensibilidad).toHaveLength(3);
  });

  it("las recomendaciones empiezan por lo que no cumple", () => {
    expect(informe.recomendaciones[0]?.prioridad).toBe(1);
    const prioridades = informe.recomendaciones.map((r) => r.prioridad);
    expect(prioridades).toEqual([...prioridades].sort());
  });

  it("marca como listo solo lo que la persona declaró y deja el resto por verificar", () => {
    const cedula = informe.documentos.find((d) => d.item.toLowerCase().includes("cédula"));
    const mayor = informe.documentos.find((d) => d.item.toLowerCase().includes("mayor de 18"));
    expect(cedula?.declaradoListo).toBe(true);
    expect(mayor?.declaradoListo).toBeNull();
  });

  it("no incluye ningún puntaje único ni la palabra «score» como resultado", () => {
    expect(informe.tituloNivel.toLowerCase()).not.toContain("score");
    expect(Object.keys(informe)).not.toContain("puntaje");
  });
});

describe("fichas técnicas", () => {
  it("cada ficha de persona tiene fórmula, lectura y fuente", () => {
    for (const f of fichasPersona()) {
      expect(f.formula).not.toBe("");
      expect(f.lectura).not.toBe("");
      expect(f.fuente).not.toBe("");
    }
  });

  it("las fichas de empresa salen del dataset de indicadores y todas tienen fuente", () => {
    const fichas = fichasEmpresa(["razon_corriente", "endeudamiento", "margen_neto", "dscr"]);
    expect(fichas.length).toBeGreaterThanOrEqual(3);
    for (const f of fichas) {
      expect(f.formula).not.toBe("");
      expect(f.fuente).not.toBe("");
    }
  });

  it("el umbral de la ficha usa las unidades de la metodología", () => {
    const f = fichasEmpresa(["endeudamiento"])[0];
    expect(f?.regla).toContain("%");
  });

  it("ignora ids que no existen", () => {
    expect(fichasEmpresa(["no_existe"])).toEqual([]);
  });
});

describe("reglas aplicadas", () => {
  it("solo trae reglas del ámbito, que afectan el nivel y sin escenarios", () => {
    for (const tipo of ["persona", "empresa"] as const) {
      const reglas = reglasAplicadas(tipo);
      expect(reglas.length).toBeGreaterThan(3);
      const esperadas = REGLAS_METODOLOGIA.filter((r) => r.ambito === (tipo === "persona" ? "personas" : "empresas") && r.afectaNivel && !r.parametro.startsWith("escenarios."));
      expect(reglas).toHaveLength(esperadas.length);
    }
  });

  it("todas dicen su origen", () => {
    for (const r of [...reglasAplicadas("persona"), ...reglasAplicadas("empresa")]) expect(r.origen).not.toBe("");
  });
});

describe("informe de empresa", () => {
  const entrada = {
    ventasAnuales: 480000, activoCorriente: 120000, pasivoCorriente: 80000, inventarios: 30000, activoTotal: 260000, pasivoTotal: 150000,
    patrimonio: 110000, utilidadNeta: 24000, utilidadOperativa: 38000, gastosFinancieros: 9000, cuentasPorCobrar: 40000,
    flujoDisponible: 45000, servicioDeuda: 30000, aniosRuc: 5, cumplimientoTributario: "si", obligacionesPatronales: "si",
    estadosFinancierosPresentados: "si", anterior: null,
  } as unknown as EntradaEmpresa;
  const res = estimarEmpresa(entrada);

  it("arma el informe con documentos de empresa y fichas de los indicadores calculados", () => {
    const ids = Object.entries(res.ratios ?? {}).filter(([, v]) => v !== null).map(([k]) => k);
    const informe = construirInforme({
      tipo: "empresa",
      fechaISO: "2026-11-05",
      nivel: res.nivel === "insuficiente" ? "debil" : res.nivel,
      factores: res.factores,
      declarados,
      cifras: [],
      documentos: documentosEmpresa(),
      fichas: fichasEmpresa(ids),
    });
    expect(informe.folio).toMatch(/^E-/);
    expect(informe.documentos.length).toBeGreaterThan(3);
    expect(informe.documentos.every((d) => d.declaradoListo === null)).toBe(true);
    expect(informe.fichas.length).toBeGreaterThan(3);
    expect(informe.escenarios).toEqual([]);
  });
});
