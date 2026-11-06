/**
 * Parámetros referenciales de las estimaciones.
 *
 * IMPORTANTE: son supuestos de este proyecto, NO normas oficiales ni políticas
 * de ninguna entidad (no existe una regla general en Ecuador que fije, por ejemplo,
 * un porcentaje único de cuota sobre ingreso; ver data/vacios.json).
 * Cada entidad aplica los suyos. Se concentran aquí para que sean visibles,
 * auditables y fáciles de cambiar. Los marcados "ejemplo de entidad" salen de
 * requisitos publicados por una entidad concreta y se citan en data/.
 */
export interface ParametrosPersona {
  edadMinima: number;
  /** Meses mínimos de ingreso estable en relación de dependencia (ejemplo de entidad: BanEcuador, 6). */
  mesesMinimosDependencia: number;
  /** Meses mínimos de ingresos comprobables para independientes (ejemplo de entidad: BanEcuador, 3). */
  mesesMinimosIndependiente: number;
  /** Máximo referencial de cuotas totales sobre ingreso mensual, en %. Supuesto propio, sin respaldo oficial. */
  maxCuotasSobreIngresoPct: number;
  /** Margen sobre el máximo en el que el resultado es "atención" y no "no cumple", en puntos porcentuales. */
  margenAtencionPct: number;
  /** Score desde el cual suele considerarse un buen punto de partida (referencia de prensa). */
  scoreFavorable: number;
  /** Score por debajo del cual las entidades suelen rechazar (referencia de prensa). */
  scoreRechazoFrecuente: number;
  /** Escenario hipotético de la prueba de estrés: caída del ingreso, en %. Editable por el usuario. */
  estresReduccionIngresoPct: number;
  /** Escenario hipotético de la prueba de estrés: aumento de las cuotas, en %. Editable por el usuario. */
  estresAumentoCuotasPct: number;
}

export const PARAMETROS_PERSONA: ParametrosPersona = {
  edadMinima: 18,
  mesesMinimosDependencia: 6,
  mesesMinimosIndependiente: 3,
  maxCuotasSobreIngresoPct: 30,
  margenAtencionPct: 20,
  scoreFavorable: 650,
  scoreRechazoFrecuente: 300,
  estresReduccionIngresoPct: 20,
  estresAumentoCuotasPct: 0,
};

/**
 * Regla de frontera: un valor exactamente igual al límite favorable (por ejemplo, cuotas justo en el máximo)
 * queda en «atención» y no en «cumple». Se puede apagar poniendo `false`.
 * No se aplica a la mayoría de edad (requisito legal) ni a la tolerancia del balance (validación del dato).
 */
export const FRONTERA_EN_ATENCION = true;

export interface ReglaRatio {
  tipo: "minimo" | "maximo";
  valor: number;
}

/**
 * Reglas generales por indicador. Deben coincidir con data/indicadores_empresas.json
 * (hay una prueba que lo verifica). Sin regla = solo se compara con el sector.
 * Cuando existan benchmarks calculados con datos oficiales, estos reemplazan a las reglas genéricas.
 */
export const REGLAS_RATIOS: Record<string, ReglaRatio> = {
  razon_corriente: { tipo: "minimo", valor: 1 },
  endeudamiento: { tipo: "maximo", valor: 70 },
  margen_neto: { tipo: "minimo", valor: 0 },
  cobertura_intereses: { tipo: "minimo", valor: 1 },
};

export interface ParametrosEmpresa {
  /** Años de RUC desde los cuales se considera antigüedad sólida (ejemplo de entidad: Banco Pichincha, 3). */
  aniosRucSolido: number;
  /** Años de RUC por debajo de los cuales la antigüedad se considera insuficiente. */
  aniosRucMinimo: number;
  /** Tolerancia al validar que el balance cuadre, como fracción del activo total. */
  toleranciaBalance: number;
  /** DSCR mínimo referencial (flujo disponible ÷ servicio de la deuda). Cuenta para el nivel solo si la empresa declara flujo y servicio de deuda. */
  dscrMinimoReferencial: number;
  reglasRatios: Record<string, ReglaRatio>;
}

export const PARAMETROS_EMPRESA: ParametrosEmpresa = {
  aniosRucSolido: 3,
  aniosRucMinimo: 1,
  toleranciaBalance: 0.05,
  dscrMinimoReferencial: 1.2,
  reglasRatios: REGLAS_RATIOS,
};

/** Mínimo de empresas válidas por celda CIIU–tamaño–año para publicar un benchmark (decisión de diseño, no exigencia legal). */
export const MUESTRA_MINIMA_BENCHMARK = 30;

export interface Escenario {
  id: "base" | "moderado" | "severo";
  nombre: string;
  /** Caída del ingreso (personas) o del flujo disponible (empresas), en %. */
  reduccionIngresoPct: number;
  /** Aumento de las cuotas (personas) o del servicio de la deuda (empresas), en %. */
  aumentoCuotasPct: number;
}

/** Escenarios hipotéticos de la metodología v1.1. Son supuestos del proyecto, no predicciones. */
export const ESCENARIOS: Escenario[] = [
  { id: "base", nombre: "Base", reduccionIngresoPct: 0, aumentoCuotasPct: 0 },
  { id: "moderado", nombre: "Moderado", reduccionIngresoPct: 10, aumentoCuotasPct: 10 },
  { id: "severo", nombre: "Severo", reduccionIngresoPct: 25, aumentoCuotasPct: 20 },
];
