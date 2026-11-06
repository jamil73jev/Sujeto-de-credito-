"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { EstadoFactor } from "@/lib/tipos";
import type { Informe } from "@/lib/informe";

const ESTADO: Record<EstadoFactor, { texto: string; clase: string }> = {
  cumple: { texto: "Cumple", clase: "ok" },
  atencion: { texto: "Atención", clase: "warn" },
  no_cumple: { texto: "No cumple", clase: "bad" },
  sin_dato: { texto: "Sin dato", clase: "" },
};

const PRIORIDAD = { 1: "Corregir", 2: "Revisar", 3: "Completar" } as const;

const FOCALIZABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Contenido del informe tal como se lee en papel. No contiene controles: la barra de herramientas va aparte. */
export function InformeDocumento({
  informe,
  nombre,
}: {
  informe: Informe;
  nombre: string;
}) {
  const esPersona = informe.tipo === "persona";
  return (
    <article className="informe" aria-labelledby="informe-titulo">
      <header className="informe-cabecera">
        <p className="informe-marca">
          Listo para Crédito · Diagnóstico orientativo
        </p>
        <h1 id="informe-titulo">
          Informe de diagnóstico {esPersona ? "personal" : "de empresa"}
        </h1>
        <dl className="informe-meta">
          <div>
            <dt>Folio</dt>
            <dd>{informe.folio}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{informe.fechaTexto}</dd>
          </div>
          <div>
            <dt>Metodología</dt>
            <dd>
              v{informe.version} ({informe.estadoMetodologia})
            </dd>
          </div>
          {nombre.trim() !== "" ? (
            <div>
              <dt>{esPersona ? "Nombre" : "Razón social"}</dt>
              <dd>{nombre.trim()}</dd>
            </div>
          ) : null}
        </dl>
        <p className="informe-leyenda">
          <strong>Estimación orientativa.</strong> No es un score, un reporte de
          buró ni una aprobación de crédito. Se calculó con los datos que
          declaraste, sin consultar ningún historial.
        </p>
      </header>

      <section aria-labelledby="inf-resultado">
        <h2 id="inf-resultado">1. Resultado</h2>
        <p className={`informe-nivel nivel-${informe.nivel}`}>
          <strong>{informe.tituloNivel}</strong>
        </p>
        <p>{informe.textoNivel}</p>
        <p className="informe-nota">
          El resultado resume el criterio más exigente: si algo no cumple, es
          Débil; si nada falla pero algo requiere atención, es Condicionado; si
          todo cumple, es Favorable. No existe un puntaje único.
        </p>
        {informe.cifras.length > 0 ? (
          <div
            className="informe-tabla"
            tabIndex={0}
            role="group"
            aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)"
          >
            <table>
              <caption>Indicadores clave y su fórmula</caption>
              <thead>
                <tr>
                  <th scope="col">Indicador</th>
                  <th scope="col" className="num">
                    Valor
                  </th>
                  <th scope="col">Cómo se calcula</th>
                </tr>
              </thead>
              <tbody>
                {informe.cifras.map((c) => (
                  <tr key={c.etiqueta}>
                    <th scope="row">{c.etiqueta}</th>
                    <td className="num">{c.valor}</td>
                    <td>{c.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="inf-dimensiones">
        <h2 id="inf-dimensiones">2. Resultado por dimensión</h2>
        {informe.dimensiones.map((d) => (
          <div className="informe-dimension" key={d.nombre}>
            <h3>
              {d.nombre}{" "}
              <span className={`etiqueta ${ESTADO[d.estado].clase}`}>
                {ESTADO[d.estado].texto}
              </span>
              {d.soloInforma ? <> <span className="etiqueta">Solo informa</span></> : null}
            </h3>
            <ul>
              {d.factores.map((f) => (
                <li key={f.id + f.etiqueta}>
                  <strong>{f.etiqueta}</strong> —{" "}
                  <span className={`etiqueta ${ESTADO[f.estado].clase}`}>
                    {ESTADO[f.estado].texto}
                  </span>
                  {f.soloInforma ? <> <span className="etiqueta">Solo informa</span></> : null}
                  . {f.detalle}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {informe.escenarios.length > 0 ? (
        <section aria-labelledby="inf-escenarios">
          <h2 id="inf-escenarios">3. Escenarios y sensibilidad</h2>
          <p className="informe-nota">
            Son hipótesis ilustrativas de la metodología, no predicciones. No
            cambian el resultado de arriba.
          </p>
          <div
            className="informe-tabla"
            tabIndex={0}
            role="group"
            aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)"
          >
            <table>
              <caption>Escenarios</caption>
              <thead>
                <tr>
                  <th scope="col">Escenario</th>
                  <th scope="col">Supuesto</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {informe.escenarios.map((e) => (
                  <tr key={e.nombre}>
                    <th scope="row">{e.nombre}</th>
                    <td>{e.supuesto}</td>
                    <td>{e.lineas.join(" · ")}</td>
                    <td>
                      <span className={`etiqueta ${ESTADO[e.estado].clase}`}>
                        {ESTADO[e.estado].texto}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul>
            {informe.sensibilidad.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="inf-reco">
        <h2 id="inf-reco">
          {informe.escenarios.length > 0 ? "4" : "3"}. Qué mejorar, en orden de
          prioridad
        </h2>
        {informe.recomendaciones.length === 0 ? (
          <p>No hay recomendaciones pendientes con los datos declarados.</p>
        ) : (
          <ol className="informe-reco">
            {informe.recomendaciones.map((r) => (
              <li key={r.criterio + r.texto}>
                <strong>{PRIORIDAD[r.prioridad]}</strong> · {r.dimension} (
                {r.criterio}). {r.texto}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="inf-docs">
        <h2 id="inf-docs">
          {informe.escenarios.length > 0 ? "5" : "4"}. Qué llevar a la entidad
        </h2>
        <p className="informe-nota">
          Lista orientativa: cada entidad define sus propios requisitos y puede
          pedir otros.
        </p>
        <div
          className="informe-tabla"
          tabIndex={0}
          role="group"
          aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)"
        >
          <table className="informe-docs">
            <caption>Documentos y requisitos habituales</caption>
            <thead>
              <tr>
                <th scope="col">Documento o requisito</th>
                <th scope="col">Dónde obtenerlo</th>
                <th scope="col">Tu situación</th>
              </tr>
            </thead>
            <tbody>
              {informe.documentos.map((d) => (
                <tr key={d.item}>
                  <th scope="row">
                    {d.item}
                    <span className="informe-sub">{d.descripcion}</span>
                  </th>
                  <td>{d.dondeObtenerlo ?? "—"}</td>
                  <td>
                    {d.declaradoListo === null
                      ? "Por verificar"
                      : d.declaradoListo
                        ? "Declaraste que lo puedes respaldar"
                        : "Falta reunirlo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="inf-datos">
        <h2 id="inf-datos">
          {informe.escenarios.length > 0 ? "6" : "5"}. Datos que declaraste
        </h2>
        <div
          className="informe-tabla"
          tabIndex={0}
          role="group"
          aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)"
        >
          <table>
            <caption>Datos usados en el cálculo</caption>
            <thead>
              <tr>
                <th scope="col">Dato</th>
                <th scope="col" className="num">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {informe.declarados.map((d) => (
                <tr key={d.etiqueta}>
                  <th scope="row">{d.etiqueta}</th>
                  <td className="num">{d.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="inf-fichas">
        <h2 id="inf-fichas">
          {informe.escenarios.length > 0 ? "7" : "6"}. Ficha técnica de los
          indicadores
        </h2>
        {informe.fichas.map((f) => (
          <div className="informe-ficha" key={f.nombre}>
            <h3>{f.nombre}</h3>
            <dl>
              <dt>Fórmula</dt>
              <dd>{f.formula}</dd>
              <dt>Cómo leerlo</dt>
              <dd>{f.lectura}</dd>
              {f.regla ? (
                <>
                  <dt>Regla aplicada</dt>
                  <dd>{f.regla}</dd>
                </>
              ) : null}
              {f.advertencias.length > 0 ? (
                <>
                  <dt>Advertencias</dt>
                  <dd>{f.advertencias.join(" ")}</dd>
                </>
              ) : null}
              <dt>Fuente</dt>
              <dd>
                {f.fuente} (confianza {f.confianza})
              </dd>
            </dl>
          </div>
        ))}
      </section>

      <section aria-labelledby="inf-reglas">
        <h2 id="inf-reglas">
          {informe.escenarios.length > 0 ? "8" : "7"}. Umbrales usados y su
          origen
        </h2>
        <p className="informe-nota">
          Los umbrales marcados como «supuesto del proyecto» no son normas ni
          políticas de una entidad. La metodología v{informe.version} está en
          estado de {informe.estadoMetodologia}.
        </p>
        <div
          className="informe-tabla"
          tabIndex={0}
          role="group"
          aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)"
        >
          <table>
            <caption>Reglas que pueden cambiar el resultado</caption>
            <thead>
              <tr>
                <th scope="col">Regla</th>
                <th scope="col">Umbral</th>
                <th scope="col">Origen</th>
                <th scope="col">Aprobación</th>
              </tr>
            </thead>
            <tbody>
              {informe.reglas.map((r) => (
                <tr key={r.regla}>
                  <th scope="row">{r.regla}</th>
                  <td>{r.umbral}</td>
                  <td>
                    {r.origen}
                    {r.fuente ? (
                      <span className="informe-sub">{r.fuente}</span>
                    ) : null}
                  </td>
                  <td>{r.aprobado ? "Aprobado" : "Pendiente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="informe-pie">
        <h2>Aviso</h2>
        <p>{informe.aviso}</p>
        <p>{informe.avisoPrivacidad}</p>
        <p className="informe-nota">
          Folio {informe.folio} · Metodología v{informe.version} ·{" "}
          {informe.fechaTexto}. El folio cambia si cambian los datos; sirve para
          comparar copias y no identifica a nadie.
        </p>
      </footer>
    </article>
  );
}

interface Props {
  informe: Informe;
  onCerrar: () => void;
}

/** Capa a pantalla completa con la barra de acciones (no se imprime) y el informe. Se monta en <body> para poder aislarlo al imprimir. */
export function InformeCapa({ informe, onCerrar }: Props) {
  const [nombre, setNombre] = useState("");
  const capa = useRef<HTMLDivElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    document.body.classList.add("con-informe");
    // Todo lo demás queda inerte (sin foco ni lectura) mientras el informe está abierto.
    const inertes = [...document.body.children].filter(
      (el) =>
        el !== capa.current?.parentElement &&
        !el.classList.contains("informe-capa") &&
        !el.hasAttribute("inert"),
    );
    for (const el of inertes) el.setAttribute("inert", "");
    cerrar.current?.focus();
    const alTeclear = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onCerrar();
        return;
      }
      if (ev.key !== "Tab" || !capa.current) return;
      const items = [
        ...capa.current.querySelectorAll<HTMLElement>(FOCALIZABLES),
      ].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const primero = items[0]!;
      const ultimo = items[items.length - 1]!;
      if (ev.shiftKey && document.activeElement === primero) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.classList.remove("con-informe");
      for (const el of inertes) el.removeAttribute("inert");
      previo?.focus();
    };
  }, [onCerrar]);

  return createPortal(
    <div
      className="informe-capa"
      ref={capa}
      role="dialog"
      aria-modal="true"
      aria-label="Informe de diagnóstico"
    >
      <div className="informe-barra">
        <div className="informe-barra-int">
          <div className="informe-nombre">
            <label htmlFor="informe-nombre">
              {informe.tipo === "persona"
                ? "Tu nombre (opcional)"
                : "Razón social (opcional)"}
            </label>
            <input
              id="informe-nombre"
              type="text"
              value={nombre}
              maxLength={80}
              autoComplete="off"
              onChange={(e) => setNombre(e.target.value)}
            />
            <span className="meta">
              Solo aparece en este informe; no se guarda. Si lo imprimes,
              quedará en el papel o el PDF.
            </span>
          </div>
          <div className="acciones">
            <button
              type="button"
              className="boton"
              onClick={() => window.print()}
            >
              Imprimir o guardar como PDF
            </button>
            <button
              type="button"
              className="boton secundario"
              ref={cerrar}
              onClick={onCerrar}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      <div className="informe-hoja">
        <InformeDocumento informe={informe} nombre={nombre} />
      </div>
    </div>,
    document.body,
  );
}
