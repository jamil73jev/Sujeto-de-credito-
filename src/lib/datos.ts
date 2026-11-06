import alertasRaw from "../../data/alertas_estafas.json";
import bandasRaw from "../../data/bandas_score.json";
import benchmarksRaw from "../../data/benchmarks_sector.json";
import checklistEmpresasRaw from "../../data/checklist_empresas.json";
import checklistPersonasRaw from "../../data/checklist_personas.json";
import fuentesRaw from "../../data/fuentes.json";
import indicadoresRaw from "../../data/indicadores_empresas.json";
import normativaRaw from "../../data/normativa.json";
import riesgosRaw from "../../data/riesgos.json";
import segmentosRaw from "../../data/segmentos_credito.json";
import textosRaw from "../../data/textos_interfaz.json";
import habitosRaw from "../../data/habitos_score.json";
import requisitosRaw from "../../data/requisitos_productos.json";
import vaciosRaw from "../../data/vacios.json";
import verificacionesRaw from "../../data/verificaciones_oficiales.json";

import {
  alertasSchema,
  bandasScoreSchema,
  benchmarksSchema,
  checklistSchema,
  fuentesSchema,
  habitosSchema,
  indicadoresSchema,
  normativaSchema,
  requisitosProductosSchema,
  riesgosSchema,
  segmentosSchema,
  textosSchema,
  vaciosSchema,
  verificacionesSchema,
} from "./schemas";

/**
 * Todos los datasets se validan al cargarse: si un JSON no cumple su esquema,
 * el build falla en lugar de publicar datos rotos.
 */
export const datos = {
  alertas: alertasSchema.parse(alertasRaw),
  bandas: bandasScoreSchema.parse(bandasRaw),
  benchmarks: benchmarksSchema.parse(benchmarksRaw),
  checklistEmpresas: checklistSchema.parse(checklistEmpresasRaw),
  checklistPersonas: checklistSchema.parse(checklistPersonasRaw),
  fuentes: fuentesSchema.parse(fuentesRaw),
  habitos: habitosSchema.parse(habitosRaw),
  indicadores: indicadoresSchema.parse(indicadoresRaw),
  normativa: normativaSchema.parse(normativaRaw),
  requisitos: requisitosProductosSchema.parse(requisitosRaw),
  riesgos: riesgosSchema.parse(riesgosRaw),
  segmentos: segmentosSchema.parse(segmentosRaw),
  textos: textosSchema.parse(textosRaw),
  vacios: vaciosSchema.parse(vaciosRaw),
  verificaciones: verificacionesSchema.parse(verificacionesRaw),
};
