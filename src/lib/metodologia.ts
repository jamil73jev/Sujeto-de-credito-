import { ESCENARIOS, PARAMETROS_EMPRESA, PARAMETROS_PERSONA } from "./parametros";

/** Versión de la metodología que produce los resultados. Cada cambio de una regla o de un umbral la incrementa. */
export const METODOLOGIA = {
  version: "1.1",
  fecha: "2026-11-05",
  estado: "borrador: umbrales aprobados; pendiente de revisión legal y verificación de fuentes",
} as const;

/** Casos de referencia resueltos en docs/casos-de-referencia.xlsx (una prueba verifica que coincida con los JSON). */
export const CASOS_DE_REFERENCIA = 53;

/**
 * De dónde sale cada umbral:
 * - norma: lo dispone una norma ecuatoriana.
 * - ejemplo_entidad: lo publica una entidad concreta; no es una regla general.
 * - convencion: criterio financiero de uso general, sin respaldo normativo.
 * - referencia_prensa: cifra citada por la prensa, sin fuente oficial.
 * - supuesto: decisión de este proyecto, sin respaldo externo.
 */
export type OrigenRegla = "norma" | "ejemplo_entidad" | "convencion" | "referencia_prensa" | "supuesto";

export const ETIQUETA_ORIGEN: Record<OrigenRegla, string> = {
  norma: "Norma",
  ejemplo_entidad: "Ejemplo de una entidad",
  convencion: "Convención financiera",
  referencia_prensa: "Referencia de prensa",
  supuesto: "Supuesto del proyecto",
};

export interface ReglaMetodologia {
  /** Clave del parámetro en parametros.ts (una prueba verifica que no falte ninguno). */
  parametro: string;
  ambito: "personas" | "empresas";
  regla: string;
  umbral: string;
  origen: OrigenRegla;
  fuente: string | null;
  /** Qué cambiaría si el analista decide otro valor. */
  alternativa: string;
  /** El analista responsable aprobó este umbral. */
  aprobado: boolean;
  /** Si cuenta para el nivel (Débil, Condicionado, Favorable) o solo informa. */
  afectaNivel: boolean;
}

const P = PARAMETROS_PERSONA;
const E = PARAMETROS_EMPRESA;

export const REGLAS_METODOLOGIA: ReglaMetodologia[] = [
  {
    parametro: "persona.edadMinima",
    ambito: "personas",
    regla: "Mayoría de edad para contratar crédito",
    umbral: `${P.edadMinima} años`,
    origen: "norma",
    fuente: "Mayoría de edad en Ecuador",
    alternativa: "No aplica: es un requisito legal.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.mesesMinimosDependencia",
    ambito: "personas",
    regla: "Antigüedad del ingreso en relación de dependencia",
    umbral: `más de ${P.mesesMinimosDependencia} meses`,
    origen: "ejemplo_entidad",
    fuente: "Requisito publicado por BanEcuador",
    alternativa: "12 meses sería más exigente; otras entidades piden menos.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.mesesMinimosIndependiente",
    ambito: "personas",
    regla: "Antigüedad de ingresos comprobables para independientes",
    umbral: `más de ${P.mesesMinimosIndependiente} meses`,
    origen: "ejemplo_entidad",
    fuente: "Requisito publicado por BanEcuador",
    alternativa: "6 meses es lo habitual en otras entidades.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.maxCuotasSobreIngresoPct",
    ambito: "personas",
    regla: "Cuotas totales (actuales y nueva) sobre el ingreso mensual",
    umbral: `menos de ${P.maxCuotasSobreIngresoPct} %`,
    origen: "supuesto",
    fuente: null,
    alternativa: "40 % era la propuesta inicial (más permisivo); 25 % sería aún más prudente. No existe un límite general en Ecuador.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.margenAtencionPct",
    ambito: "personas",
    regla: "Margen sobre el máximo de cuotas en que el resultado es «atención» y no «no cumple»",
    umbral: `${P.margenAtencionPct} puntos porcentuales`,
    origen: "supuesto",
    fuente: null,
    alternativa: "10 puntos era la propuesta inicial (más estricta). Con 20 puntos, entre el máximo y el máximo más 20 puntos el resultado es atención.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.scoreFavorable",
    ambito: "personas",
    regla: "Score desde el cual suele considerarse un buen punto de partida",
    umbral: `más de ${P.scoreFavorable}`,
    origen: "referencia_prensa",
    fuente: "Cifras citadas por la prensa; cada entidad aplica sus propios cortes",
    alternativa: "Sin respaldo oficial; el score declarado es opcional.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.scoreRechazoFrecuente",
    ambito: "personas",
    regla: "Score por debajo del cual el rechazo es frecuente",
    umbral: `menos de ${P.scoreRechazoFrecuente}`,
    origen: "referencia_prensa",
    fuente: "Cifras citadas por la prensa; cada entidad aplica sus propios cortes",
    alternativa: "Sin respaldo oficial; el score declarado es opcional.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.estresReduccionIngresoPct",
    ambito: "personas",
    regla: "Prueba de estrés: caída de ingreso (editable por la persona)",
    umbral: `${P.estresReduccionIngresoPct} %`,
    origen: "supuesto",
    fuente: null,
    alternativa: "El escenario moderado usa 10 % y el severo 25 %. La persona puede cambiarlo en el formulario.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "persona.estresAumentoCuotasPct",
    ambito: "personas",
    regla: "Prueba de estrés: aumento de cuotas (editable por la persona)",
    umbral: `${P.estresAumentoCuotasPct} %`,
    origen: "supuesto",
    fuente: null,
    alternativa: "Con tasa variable, 10 % a 20 % sería realista; se dejó en 0 % por decisión del analista.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.aniosRucSolido",
    ambito: "empresas",
    regla: "Antigüedad del RUC considerada sólida",
    umbral: `más de ${E.aniosRucSolido} años`,
    origen: "ejemplo_entidad",
    fuente: "Requisito publicado por Banco Pichincha para crédito productivo",
    alternativa: "Otras entidades piden menos.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.aniosRucMinimo",
    ambito: "empresas",
    regla: "Antigüedad del RUC por debajo de la cual es insuficiente",
    umbral: `menos de ${E.aniosRucMinimo} año`,
    origen: "supuesto",
    fuente: null,
    alternativa: "Con 2 años sería más exigente.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.toleranciaBalance",
    ambito: "empresas",
    regla: "Tolerancia para validar que el balance cuadre (activo ≈ pasivo + patrimonio)",
    umbral: `${E.toleranciaBalance * 100} % del activo total`,
    origen: "supuesto",
    fuente: null,
    alternativa: "Es una validación de calidad del dato, no un criterio de crédito.",
    aprobado: true,
    afectaNivel: false,
  },
  {
    parametro: "empresa.dscrMinimoReferencial",
    ambito: "empresas",
    regla: "Cobertura del servicio de la deuda (DSCR): cumple por encima del mínimo; atención entre 1,0 y el mínimo; no cumple por debajo de 1,0",
    umbral: `más de ${E.dscrMinimoReferencial}`,
    origen: "supuesto",
    fuente: null,
    alternativa: "Convención usada con frecuencia: entre 1,2 y 1,25. Solo cuenta si la empresa declara flujo disponible y servicio de la deuda.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.reglasRatios.razon_corriente",
    ambito: "empresas",
    regla: "Razón corriente mínima",
    umbral: `más de ${E.reglasRatios.razon_corriente?.valor}`,
    origen: "convencion",
    fuente: "Convención general de liquidez",
    alternativa: "Depende del sector; con datos sectoriales se compararía con la mediana.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.reglasRatios.endeudamiento",
    ambito: "empresas",
    regla: "Endeudamiento máximo (pasivo total ÷ activo total)",
    umbral: `menos de ${E.reglasRatios.endeudamiento?.valor} %`,
    origen: "supuesto",
    fuente: null,
    alternativa: "80 % era la propuesta inicial (más permisivo). Los límites aceptables varían por sector.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.reglasRatios.margen_neto",
    ambito: "empresas",
    regla: "Margen neto mínimo",
    umbral: `más de ${E.reglasRatios.margen_neto?.valor} % (con utilidad)`,
    origen: "convencion",
    fuente: "Una utilidad negativa indica pérdidas",
    alternativa: "Un margen mínimo positivo (por ejemplo 2 %) sería más exigente.",
    aprobado: true,
    afectaNivel: true,
  },
  {
    parametro: "empresa.reglasRatios.cobertura_intereses",
    ambito: "empresas",
    regla: "Cobertura de intereses mínima",
    umbral: `más de ${E.reglasRatios.cobertura_intereses?.valor} vez`,
    origen: "convencion",
    fuente: "Menos de 1 significa que la utilidad operativa no cubre los intereses",
    alternativa: "1,5 veces es una exigencia habitual en análisis de crédito.",
    aprobado: true,
    afectaNivel: true,
  },
  ...ESCENARIOS.filter((e) => e.id !== "base").map(
    (e): ReglaMetodologia => ({
      parametro: `escenarios.${e.id}`,
      ambito: "personas",
      regla: `Escenario ${e.nombre.toLowerCase()} (personas y empresas)`,
      umbral: `ingreso o flujo −${e.reduccionIngresoPct} %, cuotas o servicio de deuda +${e.aumentoCuotasPct} %`,
      origen: "supuesto",
      fuente: null,
      alternativa: "Son hipótesis ilustrativas, no predicciones.",
      aprobado: true,
      afectaNivel: false,
    }),
  ),
];

/** Regla de agregación que produce el nivel (decisión de diseño de la metodología). */
export const REGLA_NIVEL = [
  { nivel: "Débil", condicion: "Si algún criterio no se cumple." },
  { nivel: "Condicionado", condicion: "Si ninguno falla pero alguno queda en atención." },
  { nivel: "Favorable", condicion: "Si todos los criterios con dato se cumplen." },
  { nivel: "Faltan datos", condicion: "Si hay datos inválidos; un dato ausente no bloquea." },
] as const;

/** Reglas que valen para varios criterios a la vez. No son un umbral numérico, por eso van aparte. */
export const REGLAS_GENERALES = [
  {
    id: "frontera",
    regla: "Un valor exactamente igual al límite queda en «atención»",
    detalle:
      "Con el máximo de cuotas en 30 %, cuotas de 30 % son atención; para «cumple» deben ser menores. Pasa igual con meses de ingreso, score, razón corriente, margen neto, cobertura de intereses, DSCR, años de RUC y disponibilidad exacta en cero. No se aplica a la mayoría de edad (requisito legal) ni a la tolerancia del balance (validación del dato). Se puede apagar con un solo parámetro.",
    aprobado: true,
  },
  {
    id: "documentos",
    regla: "Los documentos faltantes informan, pero no cambian el nivel",
    detalle:
      "La lista de documentos aparece en el resultado y en el informe con su avance, pero no vuelve «Condicionado» a un perfil que cumple todo lo demás.",
    aprobado: true,
  },
  {
    id: "estres",
    regla: "La prueba de estrés solo puede llevar a «atención»",
    detalle: "Es un escenario hipotético que la persona puede cambiar: nunca vuelve «Débil» un perfil por sí sola.",
    aprobado: true,
  },
  {
    id: "simulador",
    regla: "El simulador de la portada muestra «Preliminar», no un nivel",
    detalle: "Usa supuestos fijos para lo que no pregunta (edad, antigüedad, score, mora), por eso su resultado no es una evaluación.",
    aprobado: true,
  },
] as const;
