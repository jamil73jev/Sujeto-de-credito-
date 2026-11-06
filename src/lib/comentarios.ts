import { METODOLOGIA } from "./metodologia";
import { SITE_NAME } from "./site";

export interface Comentarios {
  quien: "persona" | "empresa" | "";
  completo: "si" | "con_dificultad" | "no" | "";
  claridad: "1" | "2" | "3" | "4" | "5" | "";
  entendioNoEsScore: "si" | "mas_o_menos" | "no" | "";
  confuso: string;
  mejorar: string;
}

export const VACIO: Comentarios = {
  quien: "",
  completo: "",
  claridad: "",
  entendioNoEsScore: "",
  confuso: "",
  mejorar: "",
};

export const MAX_TEXTO = 600;

const QUIEN = {
  persona: "Persona natural",
  empresa: "Empresa / persona jurídica",
  "": "No indicó",
} as const;
const COMPLETO = {
  si: "Sí",
  con_dificultad: "Sí, con dificultad",
  no: "No",
  "": "No indicó",
} as const;
const SCORE = {
  si: "Sí",
  mas_o_menos: "Más o menos",
  no: "No",
  "": "No indicó",
} as const;

/**
 * Señales de datos personales en un texto libre: correos y secuencias largas de dígitos
 * (cédula de 10, RUC de 13, teléfonos). Es una ayuda, no una garantía.
 */
export function detectarDatosPersonales(texto: string): string[] {
  const avisos: string[] = [];
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(texto))
    avisos.push("un correo electrónico");
  if (/\d(?:[\s.-]?\d){8,}/.test(texto))
    avisos.push("un número largo (parece una cédula, un RUC o un teléfono)");
  return avisos;
}

const recortar = (t: string) => t.trim().slice(0, MAX_TEXTO);

/** Texto del mensaje de comentarios. No incluye ningún dato del diagnóstico. */
export function textoComentarios(c: Comentarios): string {
  return [
    `Comentarios sobre «${SITE_NAME}» (versión de prueba, metodología v${METODOLOGIA.version})`,
    "",
    `Soy: ${QUIEN[c.quien]}`,
    `¿Pude completar el diagnóstico?: ${COMPLETO[c.completo]}`,
    `Claridad del resultado (1 = nada clara, 5 = muy clara): ${c.claridad || "No indicó"}`,
    `¿Entendí que no es un score ni una aprobación?: ${SCORE[c.entendioNoEsScore]}`,
    "",
    "Lo que me resultó confuso:",
    recortar(c.confuso) || "(sin comentario)",
    "",
    "Lo que mejoraría:",
    recortar(c.mejorar) || "(sin comentario)",
    "",
    "— Este mensaje no incluye los datos que escribí en el diagnóstico.",
  ].join("\n");
}

export function enlaceCorreo(correo: string, c: Comentarios): string {
  const asunto = `Comentarios de prueba: ${SITE_NAME}`;
  return `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(textoComentarios(c))}`;
}
