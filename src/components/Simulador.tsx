"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Deslizador } from "@/components/Campo";
import type { TextosResultado } from "@/components/PanelVivo";
import { formatoMoneda, formatoPct, parseNumero } from "@/lib/numeros";
import { POSICION_NIVEL } from "@/lib/panel";
import { estimarPersona, type EntradaPersona } from "@/lib/personas";

interface Props {
  textos: TextosResultado;
}

/** Supuestos fijos del simulador de la portada; el diagnóstico completo de Personas permite cambiarlos. */
const SUPUESTOS = {
  edad: 32,
  tipoIngreso: "dependencia",
  mesesIngresoEstable: 24,
  scoreConocido: null,
  moraActual: "no",
} as const;

const INICIAL = { ingresoMensual: "900", gastosEsenciales: "450", cuotasMensualesActuales: "120", cuotaNuevaEstimada: "90" };

/**
 * Versión corta del diagnóstico de personas para la portada: usa el mismo motor
 * (estimarPersona) con cuatro datos y supuestos fijos. Todo se calcula en el navegador.
 */
export function Simulador({ textos }: Props) {
  const [f, setF] = useState(INICIAL);
  const set = (campo: keyof typeof INICIAL) => (v: string) => setF((p) => ({ ...p, [campo]: v }));

  const resultado = useMemo(() => {
    const gastos = parseNumero(f.gastosEsenciales);
    return estimarPersona({
      ...SUPUESTOS,
      ingresoMensual: parseNumero(f.ingresoMensual),
      cuotasMensualesActuales: parseNumero(f.cuotasMensualesActuales),
      cuotaNuevaEstimada: parseNumero(f.cuotaNuevaEstimada),
      gastosEsenciales: gastos === undefined ? null : gastos,
    } as unknown as EntradaPersona);
  }, [f]);

  const t = textos[resultado.nivel];
  const pos = POSICION_NIVEL[resultado.nivel];

  return (
    <section className="simulador" data-nivel={resultado.nivel} aria-label="Simulador rápido">
      <div className="cabeza">
        <h2>Pruébalo en 10 segundos</h2>
        <span className="pastilla">Valores de ejemplo</span>
      </div>

      <div className="campos">
        <Deslizador id="sim-ingreso" etiqueta="Ingreso mensual" sufijo="USD" min={0} max={5000} paso={50} valor={f.ingresoMensual} onCambio={set("ingresoMensual")} />
        <Deslizador id="sim-gastos" etiqueta="Gastos esenciales" sufijo="USD" min={0} max={3000} paso={25} valor={f.gastosEsenciales} onCambio={set("gastosEsenciales")} />
        <Deslizador id="sim-cuotas" etiqueta="Cuotas de deudas actuales" sufijo="USD/mes" min={0} max={1500} paso={10} valor={f.cuotasMensualesActuales} onCambio={set("cuotasMensualesActuales")} />
        <Deslizador id="sim-nueva" etiqueta="Cuota del crédito que quieres" sufijo="USD/mes" min={0} max={1500} paso={10} valor={f.cuotaNuevaEstimada} onCambio={set("cuotaNuevaEstimada")} />
      </div>

      <div className="resultado" aria-live="polite">
        <p className="veredicto">{resultado.nivel === "insuficiente" ? t.titulo : `Preliminar: ${t.titulo.charAt(0).toLowerCase()}${t.titulo.slice(1)}`}</p>
        <p className="frase">{resultado.nivel === "insuficiente" ? "Completa los cuatro datos para ver el resultado." : t.texto}</p>
        <div className="escala" data-nivel={resultado.nivel} aria-hidden="true">
          <span className="t1" />
          <span className="t2" />
          <span className="t3" />
          <i className="marca-nivel" style={{ left: `${(pos ?? 0.5) * 100}%` }} />
        </div>
        <div className="escala-etiquetas" aria-hidden="true">
          <span>Débil</span>
          <span>Condicionado</span>
          <span>Favorable</span>
        </div>
        {resultado.ratioCuotasPct !== null && resultado.ingresoDisponible !== null ? (
          <p className="nota" style={{ marginTop: "0.75rem" }}>
            Cuotas: <strong>{formatoPct(resultado.ratioCuotasPct, 1)}</strong> de tu ingreso · Te quedan{" "}
            <strong>{formatoMoneda(resultado.ingresoDisponible)}</strong> al mes
          </p>
        ) : null}
      </div>

      <p className="nota">
        Supone {SUPUESTOS.edad} años, relación de dependencia, {SUPUESTOS.mesesIngresoEstable} meses de ingreso estable y sin mora. No es un score ni una aprobación. El diagnóstico completo también revisa score, prueba de estrés y documentos, y puede dar otro nivel.{" "}
        <Link href="/personas">Hacer el diagnóstico completo</Link>
      </p>
    </section>
  );
}
