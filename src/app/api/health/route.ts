import { datos } from "@/lib/datos";

export const dynamic = "force-dynamic";

/** Comprobación de salud para el hosting y monitoreo. No expone datos de usuarios (no se almacenan). */
export function GET() {
  return Response.json(
    {
      status: "ok",
      datasets: {
        fuentes: datos.fuentes.registros.length,
        verificaciones: datos.verificaciones.registros.length,
        benchmarks: datos.benchmarks.estado,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
