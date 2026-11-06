import type {
  ResultadoEscenarioEmpresa,
  ResultadoEscenarioPersona,
  SensibilidadEmpresa,
  SensibilidadPersona,
} from "./escenarios";
import {
  ETIQUETA_ORIGEN,
  METODOLOGIA,
  REGLAS_METODOLOGIA,
} from "./metodologia";
import { resumirDimensiones } from "./panel";
import {
  ETIQUETA_DIMENSION,
  type EstadoFactor,
  type Factor,
  type NivelResultado,
} from "./tipos";

/** Un dato tal como lo declaró la persona, ya formateado para leerse en papel. */
export interface DatoDeclarado {
  etiqueta: string;
  valor: string;
}

export interface CifraInforme {
  etiqueta: string;
  valor: string;
  formula: string;
}

export interface DimensionInforme {
  nombre: string;
  estado: EstadoFactor;
  soloInforma: boolean;
  factores: Factor[];
}

export interface RecomendacionInforme {
  /** 1 = corregir (algo no cumple), 2 = revisar (atención), 3 = completar datos. */
  prioridad: 1 | 2 | 3;
  dimension: string;
  criterio: string;
  texto: string;
}

export interface DocumentoInforme {
  item: string;
  descripcion: string;
  dondeObtenerlo: string | null;
  /** true/false si la persona declaró poder respaldarlo; null si no se le preguntó. */
  declaradoListo: boolean | null;
  fuente: string;
}

export interface FichaIndicador {
  nombre: string;
  formula: string;
  lectura: string;
  advertencias: string[];
  /** Regla que se aplica, o null si el indicador solo informa. */
  regla: string | null;
  fuente: string;
  confianza: string;
}

export interface ReglaAplicada {
  regla: string;
  umbral: string;
  origen: string;
  fuente: string | null;
  aprobado: boolean;
}

export interface EscenarioInforme {
  nombre: string;
  supuesto: string;
  lineas: string[];
  estado: EstadoFactor;
}

export interface Informe {
  folio: string;
  fechaISO: string;
  fechaTexto: string;
  version: string;
  estadoMetodologia: string;
  tipo: "persona" | "empresa";
  nivel: Exclude<NivelResultado, "insuficiente">;
  tituloNivel: string;
  textoNivel: string;
  declarados: DatoDeclarado[];
  cifras: CifraInforme[];
  dimensiones: DimensionInforme[];
  escenarios: EscenarioInforme[];
  sensibilidad: string[];
  recomendaciones: RecomendacionInforme[];
  documentos: DocumentoInforme[];
  fichas: FichaIndicador[];
  reglas: ReglaAplicada[];
  aviso: string;
  avisoPrivacidad: string;
}

/** Hash FNV-1a de 32 bits (no criptográfico): solo sirve para que el folio cambie si cambian los datos. */
export function hashCorto(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).toUpperCase().padStart(8, "0").slice(0, 6);
}

/**
 * Folio del informe: fecha + huella de los datos declarados y de la versión de la metodología.
 * Permite comprobar que dos copias impresas salen de los mismos datos; no identifica a nadie ni se guarda.
 */
export function folioInforme(
  tipo: "persona" | "empresa",
  fechaISO: string,
  declarados: DatoDeclarado[],
): string {
  const huella = hashCorto(
    `${METODOLOGIA.version}|${tipo}|${declarados.map((d) => `${d.etiqueta}=${d.valor}`).join(";")}`,
  );
  return `${tipo === "persona" ? "P" : "E"}-${fechaISO.replaceAll("-", "")}-${huella}`;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function fechaLarga(fechaISO: string): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return `${d} de ${MESES[(m ?? 1) - 1]} de ${a}`;
}

const PRIORIDAD_POR_ESTADO: Partial<Record<EstadoFactor, 1 | 2 | 3>> = {
  no_cumple: 1,
  atencion: 2,
  sin_dato: 3,
};

/** Recomendaciones ordenadas: primero lo que no cumple, luego lo que requiere atención, luego los datos que faltan. */
export function recomendacionesPriorizadas(
  factores: Factor[],
): RecomendacionInforme[] {
  const lista: RecomendacionInforme[] = [];
  for (const f of factores) {
    const prioridad = PRIORIDAD_POR_ESTADO[f.estado];
    if (!prioridad || !f.recomendacion) continue;
    lista.push({
      prioridad,
      dimension: ETIQUETA_DIMENSION[f.dimension],
      criterio: f.etiqueta,
      texto: f.recomendacion,
    });
  }
  return lista.sort((a, b) => a.prioridad - b.prioridad);
}

const regla = (parametro: string) =>
  REGLAS_METODOLOGIA.find((r) => r.parametro === parametro);
const textoRegla = (
  r: { umbral: string; origen: keyof typeof ETIQUETA_ORIGEN } | undefined,
) => (r ? `${r.umbral} (${ETIQUETA_ORIGEN[r.origen].toLowerCase()})` : null);

/** Fichas de los indicadores de personas: fórmula, lectura y de dónde sale el umbral. */
export function fichasPersona(): FichaIndicador[] {
  const maxCuotas = regla("persona.maxCuotasSobreIngresoPct");
  const estres = regla("persona.estresReduccionIngresoPct");
  return [
    {
      nombre: "Cuotas sobre ingreso",
      formula: "(cuotas actuales + cuota nueva) ÷ ingreso mensual",
      lectura:
        "Qué parte de tu ingreso mensual se iría en cuotas si te dan el crédito. Cuanto menor, más margen tienes.",
      advertencias: [
        "Cada entidad aplica su propio límite; en Ecuador no hay un límite oficial general.",
      ],
      regla: textoRegla(maxCuotas),
      fuente:
        "Metodología v" +
        METODOLOGIA.version +
        ": supuesto del proyecto, pendiente de aprobación del analista.",
      confianza: "baja",
    },
    {
      nombre: "Ingreso disponible",
      formula: "ingreso mensual − gastos esenciales − cuotas totales",
      lectura:
        "Lo que te queda cada mes después de gastos esenciales y cuotas. Si es negativo, el crédito no cabe en tu presupuesto.",
      advertencias: [
        "Usa los gastos que tú declaras; si no los declaras, este criterio queda sin dato.",
      ],
      regla: "Debe ser cero o positivo",
      fuente:
        "Metodología v" +
        METODOLOGIA.version +
        ": criterio de sentido común presupuestario.",
      confianza: "media",
    },
    {
      nombre: "Cuotas con estrés",
      formula: "cuotas × (1 + alza) ÷ (ingreso × (1 − caída))",
      lectura:
        "Cómo quedarían tus cuotas sobre ingreso si tu ingreso baja o tus cuotas suben. Es una hipótesis, no una predicción.",
      advertencias: ["Solo puede llevar a «atención», nunca a «no cumple»."],
      regla: textoRegla(estres) ? `Escenario: ${textoRegla(estres)}` : null,
      fuente:
        "Metodología v" +
        METODOLOGIA.version +
        ": supuesto del proyecto, editable por la persona.",
      confianza: "baja",
    },
  ];
}

function reglaDeIndicador(id: string, general: { tipo: "minimo" | "maximo" | null; valor: number | null; nota: string }): string | null {
  // Si la metodología tiene una regla para este indicador, se usa su umbral con unidades.
  const r = regla(`empresa.reglasRatios.${id}`);
  if (r) return `${r.umbral} (${ETIQUETA_ORIGEN[r.origen].toLowerCase()}). ${general.nota}`;
  return general.valor === null ? general.nota : `${general.tipo === "minimo" ? "Mínimo" : "Máximo"} ${general.valor.toLocaleString("es-EC")}: ${general.nota}`;
}

/** Datos del dataset que el informe necesita; los arma `fuentesInforme()` en el servidor y llegan como props. */
export interface FuentesInforme {
  textosNivel: Record<"favorable" | "condicionado" | "debil", { titulo: string; texto: string }>;
  descargo: string;
  checklistPersonas: ItemChecklistInforme[];
  checklistEmpresas: ItemChecklistInforme[];
  indicadores: IndicadorInforme[];
}

interface ItemChecklistInforme {
  id: string;
  item: string;
  descripcion: string;
  donde_obtenerlo: string | null;
  fuente: string;
}

interface IndicadorInforme {
  id: string;
  nombre: string;
  formula: string;
  interpretacion: string;
  advertencias: string[];
  regla_general: { tipo: "minimo" | "maximo" | null; valor: number | null; nota: string };
  fuente_nombre: string;
  fuente_url: string | null;
  confianza: FichaIndicador["confianza"];
}

export function fichasEmpresa(ids: string[], fuentes: FuentesInforme): FichaIndicador[] {
  return fuentes.indicadores
    .filter((i) => ids.includes(i.id))
    .map((i) => ({
      nombre: i.nombre,
      formula: i.formula,
      lectura: i.interpretacion,
      advertencias: i.advertencias,
      regla: reglaDeIndicador(i.id, i.regla_general),
      fuente: i.fuente_nombre + (i.fuente_url ? ` — ${i.fuente_url}` : ""),
      confianza: i.confianza,
    }));
}

/** Reglas que pueden afectar el nivel, con su origen, para el apartado de supuestos y fuentes. */
export function reglasAplicadas(tipo: "persona" | "empresa"): ReglaAplicada[] {
  const ambito = tipo === "persona" ? "personas" : "empresas";
  return REGLAS_METODOLOGIA.filter(
    (r) =>
      r.ambito === ambito &&
      r.afectaNivel &&
      !r.parametro.startsWith("escenarios."),
  ).map((r) => ({
    regla: r.regla,
    umbral: r.umbral,
    origen: ETIQUETA_ORIGEN[r.origen],
    fuente: r.fuente,
    aprobado: r.aprobado,
  }));
}

export function documentosPersona(
  listos: Record<string, boolean>,
  idsPreguntados: string[],
  fuentes: FuentesInforme,
): DocumentoInforme[] {
  return fuentes.checklistPersonas.map((i) => ({
    item: i.item,
    descripcion: i.descripcion,
    dondeObtenerlo: i.donde_obtenerlo,
    declaradoListo: idsPreguntados.includes(i.id)
      ? (listos[i.id] ?? false)
      : null,
    fuente: i.fuente,
  }));
}

export function documentosEmpresa(fuentes: FuentesInforme): DocumentoInforme[] {
  return fuentes.checklistEmpresas.map((i) => ({
    item: i.item,
    descripcion: i.descripcion,
    dondeObtenerlo: i.donde_obtenerlo,
    declaradoListo: null,
    fuente: i.fuente,
  }));
}

const lineaPct = (v: number) =>
  new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }).format(v);

export function escenariosPersonaInforme(
  escenarios: ResultadoEscenarioPersona[],
  sens: SensibilidadPersona,
  moneda: (v: number) => string,
  pct: (v: number, d?: number) => string,
): { escenarios: EscenarioInforme[]; sensibilidad: string[] } {
  return {
    escenarios: escenarios.map((e) => ({
      nombre: e.escenario.nombre,
      supuesto:
        e.escenario.id === "base"
          ? "Sin cambios"
          : `Ingreso −${e.escenario.reduccionIngresoPct} %, cuotas +${e.escenario.aumentoCuotasPct} %`,
      lineas: [
        e.ratioPct === null
          ? "Sin ingreso"
          : `Cuotas: ${pct(e.ratioPct, 1)} del ingreso`,
        ...(e.disponible === null
          ? []
          : [`Te quedan ${moneda(e.disponible)} al mes`]),
      ],
      estado: e.estado,
    })),
    sensibilidad: [
      `Cuota nueva más alta que respeta el máximo: ${moneda(sens.cuotaNuevaMaxima)} al mes.`,
      `Ingreso mínimo para tus cuotas actuales y la nueva: ${moneda(sens.ingresoMinimo)} al mes.`,
      `Caída de ingreso que puedes absorber antes de superar el máximo: ${pct(sens.caidaIngresoMaximaPct, 0)}.`,
    ],
  };
}

export function escenariosEmpresaInforme(
  escenarios: ResultadoEscenarioEmpresa[],
  sens: SensibilidadEmpresa,
  minimo: number,
): { escenarios: EscenarioInforme[]; sensibilidad: string[] } {
  const dec = (v: number) =>
    new Intl.NumberFormat("es-EC", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  return {
    escenarios: escenarios.map((e) => ({
      nombre: e.escenario.nombre,
      supuesto:
        e.escenario.id === "base"
          ? "Sin cambios"
          : `Flujo −${e.escenario.reduccionIngresoPct} %, servicio de deuda +${e.escenario.aumentoCuotasPct} %`,
      lineas: [
        e.dscr === null
          ? "Cobertura no calculable"
          : `Cobertura de la deuda: ${dec(e.dscr)}`,
      ],
      estado: e.estado,
    })),
    sensibilidad: [
      `El flujo puede caer ${lineaPct(sens.caidaFlujoHasta1Pct)} % antes de que la cobertura baje de 1,00.`,
      `Puede caer ${lineaPct(sens.caidaFlujoHastaMinimoPct)} % antes de bajar de la referencia (${dec(minimo)}), que es un supuesto sin aprobar.`,
    ],
  };
}

interface EntradaInforme {
  tipo: "persona" | "empresa";
  fechaISO: string;
  nivel: Exclude<NivelResultado, "insuficiente">;
  factores: Factor[];
  declarados: DatoDeclarado[];
  cifras: CifraInforme[];
  escenarios?: {
    escenarios: EscenarioInforme[];
    sensibilidad: string[];
  } | null;
  documentos: DocumentoInforme[];
  fichas: FichaIndicador[];
  fuentes: FuentesInforme;
}

export function construirInforme(e: EntradaInforme): Informe {
  const textos = e.fuentes.textosNivel[e.nivel];
  return {
    folio: folioInforme(e.tipo, e.fechaISO, e.declarados),
    fechaISO: e.fechaISO,
    fechaTexto: fechaLarga(e.fechaISO),
    version: METODOLOGIA.version,
    estadoMetodologia: METODOLOGIA.estado,
    tipo: e.tipo,
    nivel: e.nivel,
    tituloNivel: textos.titulo,
    textoNivel: textos.texto,
    declarados: e.declarados,
    cifras: e.cifras,
    dimensiones: resumirDimensiones(e.factores).map((d) => ({
      nombre: ETIQUETA_DIMENSION[d.dimension],
      estado: d.estado,
      soloInforma: d.soloInforma,
      factores: d.factores,
    })),
    escenarios: e.escenarios?.escenarios ?? [],
    sensibilidad: e.escenarios?.sensibilidad ?? [],
    recomendaciones: recomendacionesPriorizadas(e.factores),
    documentos: e.documentos,
    fichas: e.fichas,
    reglas: reglasAplicadas(e.tipo),
    aviso: e.fuentes.descargo,
    avisoPrivacidad:
      "Este informe contiene los datos que declaraste. Este sitio no lo guarda ni lo envía a ningún servidor: si lo imprimes o lo guardas como PDF, quedará solo en tu equipo. Compártelo únicamente con quien tú decidas.",
  };
}
