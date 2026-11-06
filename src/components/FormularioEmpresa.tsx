"use client";

import { useMemo, useState } from "react";

import { CampoNumero, CampoTexto, Seleccion } from "@/components/Campo";
import { EscenariosEmpresa } from "@/components/Escenarios";
import {
  PanelVivo,
  type Cifra,
  type TextosResultado,
} from "@/components/PanelVivo";
import {
  compararConSector,
  estimarEmpresa,
  type BandaSector,
  type EntradaEmpresa,
  type RatioId,
} from "@/lib/empresas";
import { escenariosEmpresa } from "@/lib/escenarios";
import {
  construirInforme,
  documentosEmpresa,
  escenariosEmpresaInforme,
  fichasEmpresa,
  type DatoDeclarado,
} from "@/lib/informe";
import { formatoMoneda, formatoPct, parseNumero } from "@/lib/numeros";
import { PARAMETROS_EMPRESA } from "@/lib/parametros";
import type { Benchmark } from "@/lib/schemas";

interface Props {
  textos: TextosResultado;
  errores: {
    campo_requerido: string;
    numero_invalido: string;
    balance_no_cuadra: string;
  };
  descargoCorto: string;
  benchmarks: Benchmark[];
  /** Nombres legibles por ratio (vienen del dataset de indicadores). */
  nombresRatio: Record<string, string>;
}

/** Valores de ejemplo (una pyme ficticia) para que el panel funcione desde el inicio; se marcan como tales. */
const EJEMPLO = {
  ventasAnuales: "480000",
  activoCorriente: "120000",
  pasivoCorriente: "80000",
  inventarios: "30000",
  activoTotal: "260000",
  pasivoTotal: "150000",
  patrimonio: "110000",
  utilidadNeta: "24000",
  utilidadOperativa: "38000",
  gastosFinancieros: "9000",
  cuentasPorCobrar: "40000",
  flujoDisponible: "45000",
  servicioDeuda: "30000",
  aniosRuc: "5",
  cumplimientoTributario: "si",
  obligacionesPatronales: "si",
  estadosFinancierosPresentados: "si",
  tamano: "pequena",
  ciiu: "",
  antVentas: "",
  antUtilidad: "",
  antActivo: "",
  antPatrimonio: "",
};

const ROTULO: Record<string, string> = {
  ventasAnuales: "ventas",
  activoCorriente: "activo corriente",
  pasivoCorriente: "pasivo corriente",
  activoTotal: "activo total",
  pasivoTotal: "pasivo total",
  patrimonio: "patrimonio",
  utilidadNeta: "utilidad neta",
  aniosRuc: "años del RUC",
  inventarios: "inventarios",
};

const CONFIRMACION = [
  { valor: "si", etiqueta: "Sí, al día" },
  { valor: "no", etiqueta: "No" },
  { valor: "no_se", etiqueta: "No lo sé" },
] as const;

const BANDAS: Record<BandaSector, string> = {
  bajo_p25: "bajo el 25 % inferior",
  p25_mediana: "entre el 25 % inferior y la mediana",
  mediana_p75: "entre la mediana y el 25 % superior",
  sobre_p75: "en el 25 % superior",
};

const opcional = (t: string) => {
  const n = parseNumero(t);
  return n === undefined ? null : n;
};

export function FormularioEmpresa({
  textos,
  errores: mensajes,
  descargoCorto,
  benchmarks,
  nombresRatio,
}: Props) {
  const [f, setF] = useState(EJEMPLO);
  const [editado, setEditado] = useState(false);

  const set = (campo: keyof typeof EJEMPLO) => (valor: string) => {
    setEditado(true);
    setF((p) => ({ ...p, [campo]: valor }));
  };

  // El año anterior es opcional: solo cuenta si se llenó al menos un campo (y entonces se exigen los cuatro).
  const anterior = useMemo(() => {
    const campos = [f.antVentas, f.antUtilidad, f.antActivo, f.antPatrimonio];
    if (campos.every((c) => c.trim() === "")) return null;
    return {
      ventasAnuales: parseNumero(f.antVentas),
      utilidadNeta: parseNumero(f.antUtilidad),
      activoTotal: parseNumero(f.antActivo),
      patrimonio: parseNumero(f.antPatrimonio),
    };
  }, [f.antVentas, f.antUtilidad, f.antActivo, f.antPatrimonio]);

  const resultado = useMemo(
    () =>
      estimarEmpresa({
        ventasAnuales: parseNumero(f.ventasAnuales),
        activoCorriente: parseNumero(f.activoCorriente),
        pasivoCorriente: parseNumero(f.pasivoCorriente),
        inventarios: opcional(f.inventarios),
        activoTotal: parseNumero(f.activoTotal),
        pasivoTotal: parseNumero(f.pasivoTotal),
        patrimonio: parseNumero(f.patrimonio),
        utilidadNeta: parseNumero(f.utilidadNeta),
        utilidadOperativa: opcional(f.utilidadOperativa),
        gastosFinancieros: opcional(f.gastosFinancieros),
        cuentasPorCobrar: opcional(f.cuentasPorCobrar),
        flujoDisponible: opcional(f.flujoDisponible),
        servicioDeuda: opcional(f.servicioDeuda),
        aniosRuc: parseNumero(f.aniosRuc),
        cumplimientoTributario: f.cumplimientoTributario,
        obligacionesPatronales: f.obligacionesPatronales,
        estadosFinancierosPresentados: f.estadosFinancierosPresentados,
        anterior,
      } as unknown as EntradaEmpresa),
    [f, anterior],
  );

  // El error se muestra en el campo solo si ya tiene texto; los vacíos se listan en el panel.
  const errorDe = (campo: keyof typeof EJEMPLO) => {
    const e = resultado.errores.find((x) => x.campo === campo);
    return e && f[campo].trim() !== "" ? mensajes[e.codigo] : undefined;
  };
  const faltantes = [
    ...new Set(
      resultado.errores.map((e) =>
        e.campo === "anterior"
          ? "los cuatro datos del año anterior (o déjalos vacíos)"
          : (ROTULO[e.campo] ?? e.campo),
      ),
    ),
  ];

  const r = resultado.ratios;
  const decimal = (v: number) =>
    new Intl.NumberFormat("es-EC", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  const cifras: Cifra[] = r
    ? [
        ...(r.razon_corriente !== null
          ? [
              {
                etiqueta: "Razón corriente",
                valor: decimal(r.razon_corriente),
                formula: "activo corriente ÷ pasivo corriente",
              },
            ]
          : []),
        ...(r.endeudamiento !== null
          ? [
              {
                etiqueta: "Endeudamiento",
                valor: formatoPct(r.endeudamiento, 1),
                formula: "pasivo total ÷ activo total",
              },
            ]
          : []),
        ...(r.margen_neto !== null
          ? [
              {
                etiqueta: "Margen neto",
                valor: formatoPct(r.margen_neto, 1),
                formula: "utilidad neta ÷ ventas",
              },
            ]
          : []),
        ...(r.dscr !== null
          ? [
              {
                etiqueta: "Cobertura de la deuda",
                valor: decimal(r.dscr),
                formula: "flujo para deuda ÷ servicio de la deuda",
              },
            ]
          : []),
        ...(r.crecimiento_ventas !== null
          ? [
              {
                etiqueta: "Crecimiento de ventas",
                valor: formatoPct(r.crecimiento_ventas, 1),
                formula: "ventas del año ÷ ventas del año anterior − 1",
              },
            ]
          : []),
      ]
    : [];

  const flujoDeuda = useMemo(
    () =>
      escenariosEmpresa({
        flujoDisponible: opcional(f.flujoDisponible),
        servicioDeuda: opcional(f.servicioDeuda),
      }),
    [f.flujoDisponible, f.servicioDeuda],
  );

  const sector = useMemo(() => {
    if (!resultado.ratios || f.ciiu.trim() === "") return null;
    return compararConSector(resultado.ratios, benchmarks, {
      ciiu: f.ciiu.trim().toUpperCase(),
      tamano: f.tamano as Benchmark["tamano"],
    });
  }, [resultado, f.ciiu, f.tamano, benchmarks]);

  const generarInforme = () => {
    const nivel =
      resultado.nivel === "insuficiente" ? "condicionado" : resultado.nivel;
    const usd = (t: string) => {
      const n = parseNumero(t);
      return n === undefined ? "No declarado" : formatoMoneda(n);
    };
    const si = (v: string) =>
      v === "si" ? "Sí, al día" : v === "no" ? "No" : "No lo sabe";
    const declarados: DatoDeclarado[] = [
      { etiqueta: "Activo corriente", valor: usd(f.activoCorriente) },
      { etiqueta: "Pasivo corriente", valor: usd(f.pasivoCorriente) },
      { etiqueta: "Activo total", valor: usd(f.activoTotal) },
      { etiqueta: "Pasivo total", valor: usd(f.pasivoTotal) },
      { etiqueta: "Patrimonio", valor: usd(f.patrimonio) },
      { etiqueta: "Inventarios", valor: usd(f.inventarios) },
      { etiqueta: "Ventas del año", valor: usd(f.ventasAnuales) },
      { etiqueta: "Utilidad neta", valor: usd(f.utilidadNeta) },
      { etiqueta: "Utilidad operativa", valor: usd(f.utilidadOperativa) },
      { etiqueta: "Gastos financieros", valor: usd(f.gastosFinancieros) },
      { etiqueta: "Cuentas por cobrar", valor: usd(f.cuentasPorCobrar) },
      {
        etiqueta: "Flujo para servicio de deuda",
        valor: usd(f.flujoDisponible),
      },
      { etiqueta: "Servicio de la deuda del año", valor: usd(f.servicioDeuda) },
      ...(anterior
        ? [
            { etiqueta: "Ventas del año anterior", valor: usd(f.antVentas) },
            {
              etiqueta: "Utilidad neta del año anterior",
              valor: usd(f.antUtilidad),
            },
            {
              etiqueta: "Activo total del año anterior",
              valor: usd(f.antActivo),
            },
            {
              etiqueta: "Patrimonio del año anterior",
              valor: usd(f.antPatrimonio),
            },
          ]
        : []),
      { etiqueta: "Antigüedad del RUC", valor: `${f.aniosRuc} años` },
      { etiqueta: "Al día con el SRI", valor: si(f.cumplimientoTributario) },
      { etiqueta: "Al día con el IESS", valor: si(f.obligacionesPatronales) },
      {
        etiqueta: "Estados financieros presentados",
        valor: si(f.estadosFinancierosPresentados),
      },
    ];
    const idsCalculados = resultado.ratios
      ? (Object.entries(resultado.ratios) as Array<[string, number | null]>)
          .filter(([, v]) => v !== null)
          .map(([k]) => k)
      : [];
    return construirInforme({
      tipo: "empresa",
      fechaISO: new Date().toLocaleDateString("en-CA"),
      nivel,
      factores: resultado.factores,
      declarados,
      cifras,
      escenarios: flujoDeuda
        ? escenariosEmpresaInforme(
            flujoDeuda.escenarios,
            flujoDeuda.sensibilidad,
            PARAMETROS_EMPRESA.dscrMinimoReferencial,
          )
        : null,
      documentos: documentosEmpresa(),
      fichas: fichasEmpresa(idsCalculados),
    });
  };

  const num = (id: keyof typeof EJEMPLO, etiqueta: string, sufijo = "USD") => (
    <CampoNumero
      id={id}
      etiqueta={etiqueta}
      valor={f[id]}
      onCambio={set(id)}
      error={errorDe(id)}
      sufijo={sufijo}
    />
  );

  const confirma = (id: keyof typeof EJEMPLO, etiqueta: string) => (
    <Seleccion
      id={id}
      etiqueta={etiqueta}
      valor={f[id]}
      onCambio={set(id)}
      error={errorDe(id)}
      opciones={CONFIRMACION}
    />
  );

  return (
    <div className="espacio">
      <div className="entradas">
        <details className="grupo" open>
          <summary>Balance</summary>
          <div className="cuerpo">
            {num("activoCorriente", "Activo corriente")}
            {num("pasivoCorriente", "Pasivo corriente")}
            {num("activoTotal", "Activo total")}
            {num("pasivoTotal", "Pasivo total")}
            {num("patrimonio", "Patrimonio")}
            {num("inventarios", "Inventarios (opcional)")}
          </div>
        </details>

        <details className="grupo" open>
          <summary>Resultados del año</summary>
          <div className="cuerpo">
            {num("ventasAnuales", "Ventas")}
            {num("utilidadNeta", "Utilidad neta")}
            {num("utilidadOperativa", "Utilidad operativa (opcional)")}
            {num("gastosFinancieros", "Gastos financieros (opcional)")}
          </div>
        </details>

        <details className="grupo">
          <summary>Cobranza y deuda</summary>
          <div className="cuerpo">
            {num("cuentasPorCobrar", "Cuentas por cobrar")}
            {num("flujoDisponible", "Flujo para servicio de deuda")}
            {num("servicioDeuda", "Servicio de la deuda del año")}
          </div>
        </details>

        <details className="grupo">
          <summary>Año anterior (opcional)</summary>
          <div className="cuerpo">
            {num("antVentas", "Ventas del año anterior")}
            {num("antUtilidad", "Utilidad neta del año anterior")}
            {num("antActivo", "Activo total del año anterior")}
            {num("antPatrimonio", "Patrimonio del año anterior")}
            <p className="meta">
              Con estos cuatro datos se calculan crecimiento de ventas,
              variación del margen y rendimientos sobre saldos promedio.
            </p>
          </div>
        </details>

        <details className="grupo" open>
          <summary>Cumplimiento</summary>
          <div className="cuerpo">
            {num("aniosRuc", "Antigüedad del RUC", "años")}
            {confirma("cumplimientoTributario", "¿Al día con el SRI?")}
            {confirma("obligacionesPatronales", "¿Al día con el IESS?")}
            {confirma(
              "estadosFinancierosPresentados",
              "¿Estados financieros presentados?",
            )}
          </div>
        </details>

        <details className="grupo">
          <summary>Tu sector</summary>
          <div className="cuerpo">
            <CampoTexto
              id="ciiu"
              etiqueta="Código CIIU"
              placeholder="Ej. G4711"
              valor={f.ciiu}
              onCambio={set("ciiu")}
            />
            <Seleccion
              id="tamano"
              etiqueta="Tamaño"
              valor={f.tamano}
              onCambio={set("tamano")}
              opciones={[
                { valor: "micro", etiqueta: "Micro" },
                { valor: "pequena", etiqueta: "Pequeña" },
                { valor: "mediana", etiqueta: "Mediana" },
                { valor: "grande", etiqueta: "Grande" },
              ]}
            />
          </div>
        </details>

        <div className="acciones">
          <button
            type="button"
            className="boton secundario"
            onClick={() => {
              setF({
                ...Object.fromEntries(Object.keys(EJEMPLO).map((k) => [k, ""])),
                cumplimientoTributario: "no_se",
                obligacionesPatronales: "no_se",
                estadosFinancierosPresentados: "no_se",
                tamano: "pequena",
              } as typeof EJEMPLO);
              setEditado(true);
            }}
          >
            Empezar en blanco
          </button>
        </div>
      </div>

      <PanelVivo
        nivel={resultado.nivel}
        factores={resultado.factores}
        textos={textos}
        descargoCorto={descargoCorto}
        faltantes={faltantes}
        esEjemplo={!editado}
        cifras={cifras}
        generarInforme={generarInforme}
      >
        {resultado.ratios ? (
          <details className="dimension">
            <summary>
              <span>Todos los indicadores</span>
            </summary>
            <div className="tabla-wrap" tabIndex={0} role="group" aria-label="Tabla (se desplaza horizontalmente en pantallas pequeñas)">
              <table>
                <tbody>
                  {(Object.keys(resultado.ratios) as RatioId[]).map((id) => {
                    const v = resultado.ratios?.[id] ?? null;
                    return (
                      <tr key={id}>
                        <td>{nombresRatio[id] ?? id}</td>
                        <td className="num">
                          {v === null ? "No calculable" : v.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        ) : null}
        {flujoDeuda ? (
          <EscenariosEmpresa
            escenarios={flujoDeuda.escenarios}
            sensibilidad={flujoDeuda.sensibilidad}
            minimo={PARAMETROS_EMPRESA.dscrMinimoReferencial}
          />
        ) : null}
        {sector ? (
          <details className="dimension" open={sector.disponible}>
            <summary>
              <span>Frente a tu sector</span>
            </summary>
            {sector.disponible && sector.comparaciones.length > 0 ? (
              <ul>
                {sector.comparaciones.map((c) => (
                  <li key={c.ratio}>
                    <span className="nombre">
                      <span>{nombresRatio[c.ratio] ?? c.ratio}</span>
                      <span>{c.valor.toFixed(2)}</span>
                    </span>
                    <p>
                      {BANDAS[c.banda]} (mediana {c.mediana.toFixed(2)},{" "}
                      {c.nEmpresas} empresas, {sector.periodo})
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="meta">
                {sector.disponible
                  ? "Sin indicadores comparables."
                  : "Comparación sectorial aún no disponible."}
              </p>
            )}
          </details>
        ) : null}
      </PanelVivo>
    </div>
  );
}
