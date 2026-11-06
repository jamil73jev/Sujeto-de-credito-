"use client";

import { useCallback, useState, type ReactNode } from "react";

import { InformeCapa } from "@/components/Informe";
import type { Informe } from "@/lib/informe";

import { METODOLOGIA } from "@/lib/metodologia";
import { POSICION_NIVEL, resumirDimensiones } from "@/lib/panel";
import {
  ETIQUETA_DIMENSION,
  type EstadoFactor,
  type Factor,
  type NivelResultado,
} from "@/lib/tipos";

export interface TextosResultado {
  favorable: { titulo: string; texto: string };
  condicionado: { titulo: string; texto: string };
  debil: { titulo: string; texto: string };
  insuficiente: { titulo: string; texto: string };
}

const ESTADO: Record<EstadoFactor, { texto: string; clase: string }> = {
  cumple: { texto: "Cumple", clase: "ok" },
  atencion: { texto: "Atención", clase: "warn" },
  no_cumple: { texto: "No cumple", clase: "bad" },
  sin_dato: { texto: "Sin dato", clase: "" },
};

export interface Cifra {
  etiqueta: string;
  valor: string;
  formula: string;
}

interface Props {
  nivel: NivelResultado;
  factores: Factor[];
  textos: TextosResultado;
  descargoCorto: string;
  /** Etiquetas de los campos que faltan o son inválidos. */
  faltantes?: string[];
  /** Los valores iniciales son de ejemplo hasta que la persona edita algo. */
  esEjemplo?: boolean;
  /** Indicadores clave: el valor, su nombre y la fórmula con la que se calculó. */
  cifras?: Cifra[];
  /** Arma el informe con los datos actuales; se llama al pulsar «Generar informe» (la fecha y el folio son los de ese momento). */
  generarInforme?: () => Informe;
  children?: ReactNode;
}

/** Panel que se recalcula al editar: veredicto, escala, indicadores con su fórmula y detalle plegable. */
export function PanelVivo({
  nivel,
  factores,
  textos,
  descargoCorto,
  faltantes = [],
  esEjemplo,
  cifras = [],
  generarInforme,
  children,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [informe, setInforme] = useState<Informe | null>(null);
  const cerrarInforme = useCallback(() => setInforme(null), []);
  const t = textos[nivel];
  const dims = resumirDimensiones(factores);
  const pos = POSICION_NIVEL[nivel];
  const frase =
    nivel === "insuficiente" && faltantes.length > 0
      ? `Completa: ${faltantes.join(", ")}.`
      : t.texto;

  return (
    <>
      <aside
        className="vivo"
        data-nivel={nivel}
        data-abierto={abierto}
        aria-label="Resultado en vivo"
      >
        <div className="estado">
          <p className="veredicto" aria-live="polite">
            {t.titulo}
          </p>
          {esEjemplo ? (
            <span className="ejemplo">Valores de ejemplo</span>
          ) : null}
        </div>
        <p className="frase">{frase}</p>

        <div className="escala" data-nivel={nivel} aria-hidden="true">
          <span className="t1" />
          <span className="t2" />
          <span className="t3" />
          <i
            className="marca-nivel"
            style={{ left: `${(pos ?? 0.5) * 100}%` }}
          />
        </div>
        <div className="escala-etiquetas" aria-hidden="true">
          <span>Débil</span>
          <span>Condicionado</span>
          <span>Favorable</span>
        </div>

        <button
          type="button"
          className="boton secundario detalle-boton"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
        >
          {abierto ? "Ocultar detalle" : "Ver detalle"}
        </button>

        {generarInforme && nivel !== "insuficiente" ? (
          <button
            type="button"
            className="boton informe-boton"
            onClick={() => setInforme(generarInforme())}
          >
            Generar informe imprimible
          </button>
        ) : null}

        <div className="detalle">
          {cifras.length > 0 && nivel !== "insuficiente" ? (
            <div className="kpis">
              {cifras.map((c) => (
                <div className="kpi" key={c.etiqueta}>
                  <span className="valor">{c.valor}</span>
                  <span className="rotulo-kpi">{c.etiqueta}</span>
                  <span className="formula">{c.formula}</span>
                </div>
              ))}
            </div>
          ) : null}

          {dims.length > 0 && nivel !== "insuficiente" ? (
            <div className="dimensiones">
              {dims.map((d) => (
                <details className="dimension" key={d.dimension}>
                  <summary>
                    <span>{ETIQUETA_DIMENSION[d.dimension]}</span>
                    <span className={`etiqueta ${ESTADO[d.estado].clase}`}>
                      {ESTADO[d.estado].texto}
                    </span>
                    {d.soloInforma ? <span className="etiqueta">Solo informa</span> : null}
                  </summary>
                  <ul>
                    {d.factores.map((f) => (
                      <li key={f.id}>
                        <span className="nombre">
                          <span>{f.etiqueta}</span>
                          <span
                            className={`etiqueta ${ESTADO[f.estado].clase}`}
                          >
                            {ESTADO[f.estado].texto}
                          </span>
                          {f.soloInforma ? <span className="etiqueta">Solo informa</span> : null}
                        </span>
                        <p>{f.detalle}</p>
                        {f.recomendacion ? (
                          <p className="reco">→ {f.recomendacion}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : null}

          {nivel !== "insuficiente" && children ? (
            <div className="extra">{children}</div>
          ) : null}
          <p className="pie-panel">
            {descargoCorto}{" "}
            <span className="version">Metodología v{METODOLOGIA.version}</span>{" "}
            (borrador).
          </p>
        </div>
      </aside>
      {informe ? (
        <InformeCapa informe={informe} onCerrar={cerrarInforme} />
      ) : null}
    </>
  );
}
