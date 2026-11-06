import { describe, expect, it } from "vitest";

import { datos } from "@/lib/datos";
import { REGLAS_RATIOS } from "@/lib/parametros";

describe("datasets", () => {
  it("cargan y cumplen sus esquemas", () => {
    expect(datos.fuentes.registros.length).toBeGreaterThan(0);
    expect(datos.verificaciones.registros.length).toBeGreaterThan(0);
    expect(datos.textos.faq.length).toBeGreaterThan(0);
  });

  it("las reglas por defecto coinciden con data/indicadores_empresas.json", () => {
    const delDataset = Object.fromEntries(
      datos.indicadores.registros
        .filter((i) => i.regla_general.tipo !== null && i.regla_general.valor !== null)
        .map((i) => [i.id, { tipo: i.regla_general.tipo, valor: i.regla_general.valor }]),
    );
    expect(REGLAS_RATIOS).toEqual(delDataset);
  });

  it("los benchmarks pendientes no traen registros inventados", () => {
    if (datos.benchmarks.estado === "pendiente") expect(datos.benchmarks.registros).toEqual([]);
  });

  it("todo hecho tiene fuente con URL", () => {
    for (const f of datos.fuentes.registros) {
      if (f.traza.tipo === "hecho") expect(f.traza.fuente_url).not.toBeNull();
    }
  });
});
