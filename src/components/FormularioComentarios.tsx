"use client";

import { useMemo, useState } from "react";

import { AreaTexto, Seleccion } from "@/components/Campo";
import {
  detectarDatosPersonales,
  enlaceCorreo,
  MAX_TEXTO,
  textoComentarios,
  VACIO,
  type Comentarios,
} from "@/lib/comentarios";

/**
 * Prepara un mensaje de comentarios para enviarlo por correo. No hay servidor: el mensaje se arma en el navegador
 * y se abre en el programa de correo de la persona (o se copia). Nada del diagnóstico se incluye.
 */
export function FormularioComentarios({ correo }: { correo: string }) {
  const [c, setC] = useState<Comentarios>(VACIO);
  const [copiado, setCopiado] = useState(false);
  const set =
    <K extends keyof Comentarios>(campo: K) =>
    (valor: string) => {
      setCopiado(false);
      setC((p) => ({ ...p, [campo]: valor as Comentarios[K] }));
    };

  const avisos = useMemo(
    () => detectarDatosPersonales(`${c.confuso}\n${c.mejorar}`),
    [c.confuso, c.mejorar],
  );
  const enlace = useMemo(() => enlaceCorreo(correo, c), [correo, c]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoComentarios(c));
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="formulario-comentarios">
      <div className="aviso atencion">
        <strong>
          No escribas datos personales ni cifras de tu diagnóstico
        </strong>{" "}
        (nombre, cédula, RUC, teléfono, montos). Solo cuéntanos qué te costó
        entender o qué cambiarías.
      </div>

      <div className="rejilla">
        <Seleccion
          id="c-quien"
          etiqueta="Usé el sitio como"
          valor={c.quien}
          onCambio={set("quien")}
          opciones={[
            { valor: "", etiqueta: "Elige una opción" },
            { valor: "persona", etiqueta: "Persona natural" },
            { valor: "empresa", etiqueta: "Empresa / persona jurídica" },
          ]}
        />
        <Seleccion
          id="c-completo"
          etiqueta="¿Pudiste completar el diagnóstico?"
          valor={c.completo}
          onCambio={set("completo")}
          opciones={[
            { valor: "", etiqueta: "Elige una opción" },
            { valor: "si", etiqueta: "Sí" },
            { valor: "con_dificultad", etiqueta: "Sí, con dificultad" },
            { valor: "no", etiqueta: "No" },
          ]}
        />
        <Seleccion
          id="c-claridad"
          etiqueta="¿Qué tan claro fue el resultado?"
          valor={c.claridad}
          onCambio={set("claridad")}
          opciones={[
            { valor: "", etiqueta: "Elige una opción" },
            { valor: "1", etiqueta: "1 · Nada claro" },
            { valor: "2", etiqueta: "2" },
            { valor: "3", etiqueta: "3" },
            { valor: "4", etiqueta: "4" },
            { valor: "5", etiqueta: "5 · Muy claro" },
          ]}
        />
        <Seleccion
          id="c-score"
          etiqueta="¿Entendiste que no es un score ni una aprobación?"
          valor={c.entendioNoEsScore}
          onCambio={set("entendioNoEsScore")}
          opciones={[
            { valor: "", etiqueta: "Elige una opción" },
            { valor: "si", etiqueta: "Sí" },
            { valor: "mas_o_menos", etiqueta: "Más o menos" },
            { valor: "no", etiqueta: "No" },
          ]}
        />
      </div>

      <AreaTexto
        id="c-confuso"
        etiqueta="¿Qué te resultó confuso?"
        valor={c.confuso}
        onCambio={set("confuso")}
        maxLength={MAX_TEXTO}
        ayuda={`Hasta ${MAX_TEXTO} caracteres.`}
      />
      <AreaTexto
        id="c-mejorar"
        etiqueta="¿Qué mejorarías?"
        valor={c.mejorar}
        onCambio={set("mejorar")}
        maxLength={MAX_TEXTO}
        ayuda={`Hasta ${MAX_TEXTO} caracteres.`}
      />

      {avisos.length > 0 ? (
        <p className="aviso alerta" role="alert">
          Tu texto parece incluir {avisos.join(" y ")}. Bórralo antes de enviar.
        </p>
      ) : null}

      <div className="acciones">
        <a
          className="boton"
          href={enlace}
          aria-disabled={avisos.length > 0 || undefined}
          onClick={(e) => avisos.length > 0 && e.preventDefault()}
        >
          Abrir mi correo con el mensaje
        </a>
        <button type="button" className="boton secundario" onClick={copiar}>
          Copiar el mensaje
        </button>
        <span role="status" className="meta">
          {copiado ? "Mensaje copiado." : ""}
        </span>
      </div>
      <p className="meta">
        Se enviará desde tu propio correo a {correo}. Este sitio no recibe ni
        guarda nada de lo que escribes aquí.
      </p>
    </div>
  );
}
