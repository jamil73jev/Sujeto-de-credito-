"use client";

import { useMemo, useState } from "react";

import { CampoNumero, Deslizador, Seleccion } from "@/components/Campo";
import { EscenariosPersona } from "@/components/Escenarios";
import {
  PanelVivo,
  type Cifra,
  type TextosResultado,
} from "@/components/PanelVivo";
import { escenariosPersona } from "@/lib/escenarios";
import {
  construirInforme,
  documentosPersona,
  escenariosPersonaInforme,
  fichasPersona,
  type DatoDeclarado,
} from "@/lib/informe";
import { cuotaMensual } from "@/lib/cuota";
import { formatoMoneda, formatoPct, parseNumero } from "@/lib/numeros";
import { PARAMETROS_PERSONA } from "@/lib/parametros";
import { estimarPersona, type EntradaPersona } from "@/lib/personas";

interface Props {
  textos: TextosResultado;
  errores: {
    campo_requerido: string;
    numero_invalido: string;
    balance_no_cuadra: string;
  };
  descargoCorto: string;
  /** Tasa referencial de consumo (dato del dataset) para la calculadora; null si no hay. */
  tasaConsumoPct: number | null;
  /** Documentos que la persona puede marcar como respaldables. */
  documentos: Array<{ id: string; etiqueta: string }>;
}

/** Valores de ejemplo para que el panel funcione desde el primer momento; se marcan como tales. */
const EJEMPLO = {
  edad: "32",
  tipoIngreso: "dependencia",
  mesesIngresoEstable: "24",
  ingresoMensual: "900",
  gastosEsenciales: "450",
  cuotasMensualesActuales: "120",
  cuotaNuevaEstimada: "150",
  scoreConocido: "",
  moraActual: "no",
  estresReduccionIngreso: String(PARAMETROS_PERSONA.estresReduccionIngresoPct),
  estresAumentoCuotas: String(PARAMETROS_PERSONA.estresAumentoCuotasPct),
};

const ROTULO: Record<string, string> = {
  edad: "edad",
  tipoIngreso: "tipo de ingreso",
  mesesIngresoEstable: "meses de ingreso",
  ingresoMensual: "ingreso mensual",
  gastosEsenciales: "gastos esenciales",
  cuotasMensualesActuales: "cuotas actuales",
  cuotaNuevaEstimada: "cuota nueva",
  scoreConocido: "score",
  moraActual: "mora",
  estresReduccionIngreso: "caída de ingreso",
  estresAumentoCuotas: "aumento de cuotas",
  documentos: "documentos",
};

export function FormularioPersona({
  textos,
  errores: mensajes,
  descargoCorto,
  tasaConsumoPct,
  documentos,
}: Props) {
  const [f, setF] = useState(EJEMPLO);
  const [editado, setEditado] = useState(false);
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [calc, setCalc] = useState({
    monto: "",
    plazo: "",
    tasa: tasaConsumoPct === null ? "" : String(tasaConsumoPct),
  });

  const set = (campo: keyof typeof EJEMPLO) => (valor: string) => {
    setEditado(true);
    setF((p) => ({ ...p, [campo]: valor }));
  };

  const resultado = useMemo(() => {
    const gastos = parseNumero(f.gastosEsenciales);
    const entrada = {
      edad: parseNumero(f.edad),
      tipoIngreso: f.tipoIngreso,
      mesesIngresoEstable: parseNumero(f.mesesIngresoEstable),
      ingresoMensual: parseNumero(f.ingresoMensual),
      cuotasMensualesActuales: parseNumero(f.cuotasMensualesActuales),
      cuotaNuevaEstimada: parseNumero(f.cuotaNuevaEstimada),
      scoreConocido: parseNumero(f.scoreConocido) ?? null,
      moraActual: f.moraActual,
      gastosEsenciales: gastos === undefined ? null : gastos,
      estres: {
        reduccionIngresoPct: parseNumero(f.estresReduccionIngreso),
        aumentoCuotasPct: parseNumero(f.estresAumentoCuotas),
      },
      documentos: documentos.length
        ? {
            listos: documentos.filter((d) => marcados[d.id]).length,
            total: documentos.length,
          }
        : null,
    };
    return estimarPersona(entrada as unknown as EntradaPersona);
  }, [f, marcados, documentos]);

  // Solo se marca un error en el campo si la persona ya escribió algo; los vacíos se listan en el panel.
  const errorDe = (campo: keyof typeof EJEMPLO) => {
    const e = resultado.errores.find((x) => x.campo === campo);
    return e && f[campo].trim() !== "" ? mensajes[e.codigo] : undefined;
  };
  const faltantes = [
    ...new Set(resultado.errores.map((e) => ROTULO[e.campo] ?? e.campo)),
  ];

  const cuotaCalculada = useMemo(() => {
    const monto = parseNumero(calc.monto);
    const plazo = parseNumero(calc.plazo);
    const tasa = parseNumero(calc.tasa);
    if (monto === undefined || plazo === undefined || tasa === undefined)
      return null;
    const c = cuotaMensual(monto, tasa, plazo);
    return Number.isFinite(c) ? c : null;
  }, [calc]);

  const escenarios = useMemo(() => {
    if (resultado.errores.length > 0) return null;
    const ingreso = parseNumero(f.ingresoMensual);
    const gastos = parseNumero(f.gastosEsenciales);
    const actuales = parseNumero(f.cuotasMensualesActuales);
    const nueva = parseNumero(f.cuotaNuevaEstimada);
    if (
      [ingreso, actuales, nueva].some((v) => v === undefined || Number.isNaN(v))
    )
      return null;
    return escenariosPersona({
      ingresoMensual: ingreso as number,
      gastosEsenciales:
        gastos === undefined || Number.isNaN(gastos) ? null : gastos,
      cuotasMensualesActuales: actuales as number,
      cuotaNuevaEstimada: nueva as number,
    });
  }, [f, resultado.errores.length]);

  const cifras: Cifra[] = [
    ...(resultado.ratioCuotasPct !== null
      ? [
          {
            etiqueta: "Cuotas sobre ingreso",
            valor: formatoPct(resultado.ratioCuotasPct, 1),
            formula: "(cuotas actuales + cuota nueva) ÷ ingreso mensual",
          },
        ]
      : []),
    ...(resultado.ingresoDisponible !== null
      ? [
          {
            etiqueta: "Te quedan al mes",
            valor: formatoMoneda(resultado.ingresoDisponible),
            formula: "ingreso − gastos esenciales − cuotas",
          },
        ]
      : []),
    ...(resultado.ratioEstresPct !== null
      ? [
          {
            etiqueta: "Cuotas sobre ingreso, con estrés",
            valor: formatoPct(resultado.ratioEstresPct, 1),
            formula: "cuotas con alza ÷ ingreso con caída (prueba de estrés)",
          },
        ]
      : []),
  ];

  const generarInforme = () => {
    const nivel =
      resultado.nivel === "insuficiente" ? "condicionado" : resultado.nivel;
    const gastos = parseNumero(f.gastosEsenciales);
    const score = parseNumero(f.scoreConocido);
    const declarados: DatoDeclarado[] = [
      { etiqueta: "Edad", valor: `${f.edad} años` },
      {
        etiqueta: "Tipo de ingreso",
        valor:
          f.tipoIngreso === "dependencia"
            ? "Relación de dependencia"
            : "Independiente / negocio propio",
      },
      { etiqueta: "Meses con ingreso estable", valor: f.mesesIngresoEstable },
      {
        etiqueta: "Ingreso mensual comprobable",
        valor: formatoMoneda(parseNumero(f.ingresoMensual) ?? 0),
      },
      {
        etiqueta: "Gastos esenciales al mes",
        valor: gastos === undefined ? "No declarado" : formatoMoneda(gastos),
      },
      {
        etiqueta: "Cuotas de deudas actuales",
        valor: formatoMoneda(parseNumero(f.cuotasMensualesActuales) ?? 0),
      },
      {
        etiqueta: "Cuota del crédito que quiere",
        valor: formatoMoneda(parseNumero(f.cuotaNuevaEstimada) ?? 0),
      },
      {
        etiqueta: "Deudas en mora",
        valor:
          f.moraActual === "no"
            ? "No"
            : f.moraActual === "si"
              ? "Sí"
              : "No lo sabe",
      },
      {
        etiqueta: "Score declarado",
        valor: score === undefined ? "No declarado" : String(score),
      },
      {
        etiqueta: "Prueba de estrés",
        valor: `ingreso −${f.estresReduccionIngreso} %, cuotas +${f.estresAumentoCuotas} %`,
      },
      ...(documentos.length
        ? [
            {
              etiqueta: "Documentos que puede respaldar",
              valor: `${documentos.filter((d) => marcados[d.id]).length} de ${documentos.length}`,
            },
          ]
        : []),
    ];
    return construirInforme({
      tipo: "persona",
      fechaISO: new Date().toLocaleDateString("en-CA"),
      nivel,
      factores: resultado.factores,
      declarados,
      cifras,
      escenarios: escenarios
        ? escenariosPersonaInforme(
            escenarios.escenarios,
            escenarios.sensibilidad,
            formatoMoneda,
            formatoPct,
          )
        : null,
      documentos: documentosPersona(
        marcados,
        documentos.map((d) => d.id),
      ),
      fichas: fichasPersona(),
    });
  };

  return (
    <div className="espacio">
      <div className="entradas">
        <details className="grupo" open>
          <summary>Tu perfil</summary>
          <div className="cuerpo">
            <Deslizador
              id="edad"
              etiqueta="Edad"
              sufijo="años"
              min={18}
              max={75}
              paso={1}
              valor={f.edad}
              onCambio={set("edad")}
              error={errorDe("edad")}
            />
            <Seleccion
              id="tipoIngreso"
              etiqueta="Tipo de ingreso"
              valor={f.tipoIngreso}
              onCambio={set("tipoIngreso")}
              error={errorDe("tipoIngreso")}
              opciones={[
                { valor: "dependencia", etiqueta: "Relación de dependencia" },
                {
                  valor: "independiente",
                  etiqueta: "Independiente / negocio propio",
                },
              ]}
            />
            <Deslizador
              id="mesesIngresoEstable"
              etiqueta="Meses con ingreso estable"
              sufijo="meses"
              min={0}
              max={120}
              paso={1}
              valor={f.mesesIngresoEstable}
              onCambio={set("mesesIngresoEstable")}
              error={errorDe("mesesIngresoEstable")}
            />
            <Deslizador
              id="ingresoMensual"
              etiqueta="Ingreso mensual comprobable"
              sufijo="USD"
              min={0}
              max={10000}
              paso={50}
              valor={f.ingresoMensual}
              onCambio={set("ingresoMensual")}
              error={errorDe("ingresoMensual")}
            />
            <Deslizador
              id="gastosEsenciales"
              etiqueta="Gastos esenciales al mes"
              sufijo="USD"
              min={0}
              max={5000}
              paso={25}
              valor={f.gastosEsenciales}
              onCambio={set("gastosEsenciales")}
              error={errorDe("gastosEsenciales")}
            />
          </div>
        </details>

        <details className="grupo" open>
          <summary>Deudas e historial</summary>
          <div className="cuerpo">
            <Deslizador
              id="cuotasMensualesActuales"
              etiqueta="Cuotas de deudas actuales"
              sufijo="USD/mes"
              min={0}
              max={3000}
              paso={10}
              valor={f.cuotasMensualesActuales}
              onCambio={set("cuotasMensualesActuales")}
              error={errorDe("cuotasMensualesActuales")}
            />
            <Deslizador
              id="cuotaNuevaEstimada"
              etiqueta="Cuota del crédito que quieres"
              sufijo="USD/mes"
              min={0}
              max={3000}
              paso={10}
              valor={f.cuotaNuevaEstimada}
              onCambio={set("cuotaNuevaEstimada")}
              error={errorDe("cuotaNuevaEstimada")}
            />
            <Seleccion
              id="moraActual"
              etiqueta="¿Tienes deudas en mora?"
              valor={f.moraActual}
              onCambio={set("moraActual")}
              error={errorDe("moraActual")}
              opciones={[
                { valor: "no", etiqueta: "No" },
                { valor: "si", etiqueta: "Sí" },
                { valor: "no_se", etiqueta: "No lo sé" },
              ]}
            />
            <CampoNumero
              id="scoreConocido"
              etiqueta="Tu score (opcional)"
              ayuda="De 1 a 999"
              valor={f.scoreConocido}
              onCambio={set("scoreConocido")}
              error={errorDe("scoreConocido")}
            />
          </div>
        </details>

        <details className="grupo">
          <summary>Prueba de estrés</summary>
          <div className="cuerpo">
            <Deslizador
              id="estresReduccionIngreso"
              etiqueta="Si tu ingreso cae"
              sufijo="%"
              min={0}
              max={60}
              paso={5}
              valor={f.estresReduccionIngreso}
              onCambio={set("estresReduccionIngreso")}
              error={errorDe("estresReduccionIngreso")}
            />
            <Deslizador
              id="estresAumentoCuotas"
              etiqueta="Si tus cuotas suben"
              sufijo="%"
              min={0}
              max={50}
              paso={5}
              valor={f.estresAumentoCuotas}
              onCambio={set("estresAumentoCuotas")}
              error={errorDe("estresAumentoCuotas")}
            />
          </div>
        </details>

        {documentos.length > 0 ? (
          <details className="grupo">
            <summary>Documentos que puedes respaldar</summary>
            <div className="cuerpo">
              <div className="casillas">
                {documentos.map((d) => (
                  <label className="casilla" key={d.id}>
                    <input
                      type="checkbox"
                      checked={marcados[d.id] ?? false}
                      onChange={(e) => {
                        setEditado(true);
                        setMarcados((p) => ({
                          ...p,
                          [d.id]: e.target.checked,
                        }));
                      }}
                    />
                    <span>{d.etiqueta}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        ) : null}

        <details className="grupo">
          <summary>Calculadora de cuota</summary>
          <div className="cuerpo">
            <CampoNumero
              id="calc-monto"
              etiqueta="Monto"
              sufijo="USD"
              valor={calc.monto}
              onCambio={(v) => setCalc((p) => ({ ...p, monto: v }))}
            />
            <CampoNumero
              id="calc-plazo"
              etiqueta="Plazo"
              sufijo="meses"
              valor={calc.plazo}
              onCambio={(v) => setCalc((p) => ({ ...p, plazo: v }))}
            />
            <CampoNumero
              id="calc-tasa"
              etiqueta="Tasa efectiva anual"
              sufijo="%"
              ayuda={
                tasaConsumoPct === null
                  ? undefined
                  : "Referencial de consumo (BCE). La real la fija cada entidad."
              }
              valor={calc.tasa}
              onCambio={(v) => setCalc((p) => ({ ...p, tasa: v }))}
            />
            <div className="acciones">
              {cuotaCalculada !== null ? (
                <>
                  <span>
                    Cuota: <strong>{formatoMoneda(cuotaCalculada)}</strong>/mes
                  </span>
                  <button
                    type="button"
                    className="boton secundario"
                    onClick={() =>
                      set("cuotaNuevaEstimada")(cuotaCalculada.toFixed(0))
                    }
                  >
                    Usar como cuota nueva
                  </button>
                </>
              ) : (
                <span className="meta">Completa monto, plazo y tasa.</span>
              )}
            </div>
          </div>
        </details>

        <div className="acciones">
          <button
            type="button"
            className="boton secundario"
            onClick={() => {
              setF({
                ...EJEMPLO,
                edad: "",
                mesesIngresoEstable: "",
                ingresoMensual: "",
                gastosEsenciales: "",
                cuotasMensualesActuales: "0",
                cuotaNuevaEstimada: "0",
              });
              setMarcados({});
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
        {escenarios ? (
          <EscenariosPersona
            escenarios={escenarios.escenarios}
            sensibilidad={escenarios.sensibilidad}
          />
        ) : null}
      </PanelVivo>
    </div>
  );
}
