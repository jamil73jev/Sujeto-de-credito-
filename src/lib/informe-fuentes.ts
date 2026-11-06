import { datos } from "./datos";
import type { FuentesInforme } from "./informe";

/**
 * Datos del dataset que el informe necesita, reducidos a lo mínimo y serializables.
 * Solo se llama desde código de servidor (páginas) y pruebas: así el navegador no descarga
 * ni valida los 15 datasets (ni zod) para poder armar un informe.
 */
export function fuentesInforme(): FuentesInforme {
  const checklist = (registros: typeof datos.checklistPersonas.registros) =>
    registros.map((i) => ({
      id: i.id,
      item: i.item,
      descripcion: i.descripcion,
      donde_obtenerlo: i.donde_obtenerlo,
      fuente: i.traza.fuente_nombre,
    }));
  return {
    textosNivel: datos.textos.resultados,
    descargo: datos.textos.descargo,
    checklistPersonas: checklist(datos.checklistPersonas.registros),
    checklistEmpresas: checklist(datos.checklistEmpresas.registros),
    indicadores: datos.indicadores.registros.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      formula: i.formula,
      interpretacion: i.interpretacion,
      advertencias: i.advertencias,
      regla_general: i.regla_general,
      fuente_nombre: i.traza.fuente_nombre,
      fuente_url: i.traza.fuente_url,
      confianza: i.traza.confianza,
    })),
  };
}
