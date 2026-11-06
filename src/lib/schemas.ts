import { z } from "zod";

const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha con formato AAAA-MM-DD");
const periodoMes = z.string().regex(/^\d{4}-\d{2}$/, "Periodo con formato AAAA-MM");
const periodoAnio = z.string().regex(/^\d{4}$/, "Periodo con formato AAAA");
const texto = z.string().min(1);

/** Trazabilidad obligatoria en cada registro: de dónde sale el dato y qué tan confiable es. */
export const trazaSchema = z
  .strictObject({
    fuente_nombre: texto,
    fuente_url: z.url().nullable(),
    fecha_publicacion: fecha.nullable(),
    fecha_consulta: fecha,
    tipo: z.enum(["hecho", "interpretacion", "recomendacion"]),
    confianza: z.enum(["alta", "media", "baja"]),
    desactualizado: z.boolean(),
  })
  .refine((t) => t.tipo !== "hecho" || t.fuente_url !== null, {
    message: "Un registro de tipo 'hecho' requiere fuente_url",
  });
export type Traza = z.infer<typeof trazaSchema>;

const sobre = <T extends z.ZodType>(registro: T) =>
  z.strictObject({ version: z.number().int().positive(), registros: z.array(registro) });

// ---------- fuentes ----------
export const fuenteSchema = z.strictObject({
  id: texto,
  nombre_oficial: texto,
  entidad: texto,
  url: z.url().nullable(),
  url_verificada: z.boolean(),
  formato: z.enum(["solo_web", "pdf", "csv", "xlsx", "api", "no_confirmado"]),
  frecuencia_actualizacion: z.string().nullable(),
  cobertura: texto,
  licencia: z.string().nullable(),
  uso_automatizado: z.enum(["si", "no", "no_confirmado"]),
  notas: z.string(),
  traza: trazaSchema,
});
export const fuentesSchema = sobre(fuenteSchema);
export type Fuente = z.infer<typeof fuenteSchema>;

// ---------- normativa ----------
export const normaSchema = z.strictObject({
  id: texto,
  nombre: texto,
  numero: z.string().nullable(),
  fecha_expedicion: fecha.nullable(),
  estado_vigencia: texto,
  que_regula: texto,
  implicacion_para_el_sitio: texto,
  url: z.url(),
  traza: trazaSchema,
});
export const normativaSchema = sobre(normaSchema);
export type Norma = z.infer<typeof normaSchema>;

// ---------- segmentos de crédito ----------
export const segmentoSchema = z.strictObject({
  id: texto,
  segmento: texto,
  descripcion: texto,
  /** Estadística de operaciones otorgadas (no es una oferta ni un límite). */
  tasa_referencial_pct: z.number().min(0).max(100).nullable(),
  /** Límite regulatorio por segmento. */
  tasa_maxima_pct: z.number().min(0).max(100).nullable(),
  periodo: periodoMes,
  traza: trazaSchema,
});
export const segmentosSchema = sobre(segmentoSchema);
export type Segmento = z.infer<typeof segmentoSchema>;

// ---------- bandas de score ----------
export const bandasScoreSchema = z.strictObject({
  version: z.number().int().positive(),
  rango_min: z.number().int(),
  rango_max: z.number().int(),
  nota: texto,
  bandas: z.array(
    z.strictObject({
      id: texto,
      desde: z.number().int(),
      hasta: z.number().int(),
      etiqueta: texto,
      interpretacion: texto,
      oficial: z.boolean(),
      traza: trazaSchema,
    }),
  ),
  referencias: z.array(
    z.strictObject({ id: texto, valor: z.number(), descripcion: texto, traza: trazaSchema }),
  ),
});
export type BandasScore = z.infer<typeof bandasScoreSchema>;

// ---------- verificaciones oficiales ----------
export const verificacionSchema = z.strictObject({
  id: texto,
  servicio: texto,
  entidad: texto,
  que_muestra: texto,
  quien_puede_consultar: texto,
  requisitos: z.array(texto),
  costo: z.string().nullable(),
  pasos: z.array(texto),
  url: z.url().nullable(),
  exige_login: z.boolean().nullable(),
  traza: trazaSchema,
});
export const verificacionesSchema = sobre(verificacionSchema);
export type Verificacion = z.infer<typeof verificacionSchema>;

// ---------- alertas de estafas ----------
export const alertaSchema = z.strictObject({
  id: texto,
  titulo: texto,
  descripcion: texto,
  como_reconocerla: z.array(texto),
  que_hacer: z.array(texto),
  traza: trazaSchema,
});
export const alertasSchema = sobre(alertaSchema);
export type Alerta = z.infer<typeof alertaSchema>;

// ---------- checklists ----------
export const itemChecklistSchema = z.strictObject({
  id: texto,
  item: texto,
  descripcion: texto,
  donde_obtenerlo: z.string().nullable(),
  url: z.url().nullable(),
  peso_referencial: z.number().nullable(),
  es_ejemplo_de_entidad: z.boolean(),
  traza: trazaSchema,
});
export const checklistSchema = sobre(itemChecklistSchema);
export type ItemChecklist = z.infer<typeof itemChecklistSchema>;

// ---------- indicadores de empresas ----------
export const indicadorSchema = z.strictObject({
  id: texto,
  nombre: texto,
  formula: texto,
  cuentas_requeridas: z.array(texto),
  interpretacion: texto,
  advertencias: z.array(texto),
  regla_general: z.strictObject({
    tipo: z.enum(["minimo", "maximo"]).nullable(),
    valor: z.number().nullable(),
    nota: texto,
  }),
  traza: trazaSchema,
});
export const indicadoresSchema = sobre(indicadorSchema);
export type Indicador = z.infer<typeof indicadorSchema>;

// ---------- benchmarks por sector ----------
export const benchmarkSchema = z.strictObject({
  ciiu: texto,
  tamano: z.enum(["micro", "pequena", "mediana", "grande"]),
  periodo: periodoAnio,
  ratio_id: texto,
  p10: z.number(),
  p25: z.number(),
  mediana: z.number(),
  p75: z.number(),
  p90: z.number(),
  n_empresas: z.number().int().positive(),
  traza: trazaSchema,
});
export const benchmarksSchema = z.strictObject({
  version: z.number().int().positive(),
  estado: z.enum(["pendiente", "activo"]),
  nota: texto,
  registros: z.array(benchmarkSchema),
});
export type Benchmark = z.infer<typeof benchmarkSchema>;

// ---------- textos de interfaz ----------
const bloqueResultado = z.strictObject({ titulo: texto, texto });
export const textosSchema = z.strictObject({
  version: z.number().int().positive(),
  titulo: texto,
  subtitulo: texto,
  descargo: texto,
  descargo_corto: texto,
  privacidad: texto,
  resultados: z.strictObject({
    favorable: bloqueResultado,
    condicionado: bloqueResultado,
    debil: bloqueResultado,
    insuficiente: bloqueResultado,
  }),
  errores: z.strictObject({
    campo_requerido: texto,
    numero_invalido: texto,
    balance_no_cuadra: texto,
  }),
  faq: z.array(z.strictObject({ pregunta: texto, respuesta: texto })),
  glosario: z.array(z.strictObject({ termino: texto, definicion: texto })),
});
export type Textos = z.infer<typeof textosSchema>;

// ---------- vacíos y riesgos ----------
export const vacioSchema = z.strictObject({
  id: texto,
  dato: texto,
  donde_obtenerlo: texto,
  impacto: z.enum(["alto", "medio", "bajo"]),
  accion_sugerida: texto,
});
export const vaciosSchema = sobre(vacioSchema);
export type Vacio = z.infer<typeof vacioSchema>;

export const riesgoSchema = z.strictObject({
  id: texto,
  riesgo: texto,
  probabilidad: z.enum(["alta", "media", "baja"]),
  impacto: z.enum(["alto", "medio", "bajo"]),
  mitigacion: texto,
  tipo: z.enum(["legal", "reputacional", "tecnico"]),
});
export const riesgosSchema = sobre(riesgoSchema);
export type Riesgo = z.infer<typeof riesgoSchema>;

// ---------- requisitos publicados por entidad y producto ----------
export const requisitoProductoSchema = z.strictObject({
  id: texto,
  entidad: texto,
  producto: texto,
  requisito_publicado: texto,
  no_inferir: texto,
  url: z.url(),
  traza: trazaSchema,
});
export const requisitosProductosSchema = sobre(requisitoProductoSchema);
export type RequisitoProducto = z.infer<typeof requisitoProductoSchema>;

// ---------- hábitos que influyen en el score ----------
export const habitoSchema = z.strictObject({
  id: texto,
  habito: texto,
  detalle: texto,
  traza: trazaSchema,
});
export const habitosSchema = sobre(habitoSchema);
export type Habito = z.infer<typeof habitoSchema>;
