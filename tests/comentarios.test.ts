import { describe, expect, it } from "vitest";

import { detectarDatosPersonales, enlaceCorreo, MAX_TEXTO, textoComentarios, VACIO } from "../src/lib/comentarios";

describe("detectarDatosPersonales", () => {
  it("detecta un correo", () => {
    expect(detectarDatosPersonales("escríbeme a ana@correo.com")).toHaveLength(1);
  });
  it("detecta una cédula, un RUC y un teléfono", () => {
    expect(detectarDatosPersonales("mi cédula es 0912345678")).toHaveLength(1);
    expect(detectarDatosPersonales("RUC 0992345678001")).toHaveLength(1);
    expect(detectarDatosPersonales("llámame al 09 8765 4321")).toHaveLength(1);
  });
  it("no marca cifras cortas ni texto normal", () => {
    expect(detectarDatosPersonales("el resultado 30,0 % no se entiende; pasé 5 minutos")).toEqual([]);
    expect(detectarDatosPersonales("")).toEqual([]);
  });
});

describe("mensaje de comentarios", () => {
  it("no incluye datos del diagnóstico y avisa de ello", () => {
    const t = textoComentarios({ ...VACIO, quien: "persona", completo: "si", claridad: "4", confuso: "la escala", mejorar: "más ejemplos" });
    expect(t).toContain("Persona natural");
    expect(t).toContain("la escala");
    expect(t).toContain("no incluye los datos que escribí en el diagnóstico");
  });
  it("recorta los textos largos", () => {
    const t = textoComentarios({ ...VACIO, confuso: "x".repeat(MAX_TEXTO + 500) });
    expect(t).not.toContain("x".repeat(MAX_TEXTO + 1));
  });
  it("el enlace es mailto con asunto y cuerpo codificados", () => {
    const e = enlaceCorreo("a@b.ec", { ...VACIO, confuso: "¿qué es 100 %?" });
    expect(e.startsWith("mailto:a@b.ec?subject=")).toBe(true);
    expect(e).toContain("&body=");
    expect(e).not.toContain(" ");
  });
});
