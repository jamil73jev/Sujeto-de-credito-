import { formatoFecha } from "@/lib/numeros";
import type { Traza } from "@/lib/schemas";

/** Muestra de dónde sale un dato: fuente enlazada, fecha de consulta y alertas de vigencia. */
export function FuenteTraza({ traza }: { traza: Traza }) {
  return (
    <span className="meta">
      Fuente:{" "}
      {traza.fuente_url ? (
        <a href={traza.fuente_url} target="_blank" rel="noopener noreferrer">
          {traza.fuente_nombre}
        </a>
      ) : (
        traza.fuente_nombre
      )}
      {traza.fecha_publicacion ? ` (${formatoFecha(traza.fecha_publicacion)})` : ""} · consultada {formatoFecha(traza.fecha_consulta)} · confianza {traza.confianza}
      {traza.tipo !== "hecho" ? ` · ${traza.tipo}` : ""}
      {traza.desactualizado ? (
        <>
          {" "}
          <span className="etiqueta warn">Verificar vigencia</span>
        </>
      ) : null}
    </span>
  );
}
