export const WAVE_VIEWBOX_WIDTH = 600;
export const WAVE_BASELINE = 90;
export const WAVE_AMPLITUDE = 4;
export const WAVE_THICKNESS = 9;
export const WAVE_PERIODS = 1;
export const HEADER_ZONE_HEIGHT = 112;

/**
 * Traza la curva ondulada (misma fórmula seno-aproximada por curvas cúbicas)
 * a lo largo de `width`, alrededor de `baseline`, en la dirección indicada.
 * Se usa tanto para el borde inferior del fondo oscuro como para los bordes
 * de la cinta amarilla, de forma que ambas figuras compartan exactamente la
 * misma curva y no quede un borde recto asomando.
 */
function traceWave(
  width: number,
  baseline: number,
  amplitude: number,
  periods: number,
  direction: "forward" | "backward"
): string {
  const period = width / periods;
  const half = period / 2;
  const order = direction === "forward" ? [...Array(periods).keys()] : [...Array(periods).keys()].reverse();

  return order
    .map((i) => {
      const x0 = i * period;
      if (direction === "forward") {
        return (
          `C${x0 + half / 3},${baseline - amplitude} ${x0 + (half * 2) / 3},${baseline - amplitude} ${x0 + half},${baseline}` +
          ` C${x0 + half + half / 3},${baseline + amplitude} ${x0 + half + (half * 2) / 3},${baseline + amplitude} ${x0 + period},${baseline}`
        );
      }
      return (
        `C${x0 + half + (half * 2) / 3},${baseline + amplitude} ${x0 + half + half / 3},${baseline + amplitude} ${x0 + half},${baseline}` +
        ` C${x0 + (half * 2) / 3},${baseline - amplitude} ${x0 + half / 3},${baseline - amplitude} ${x0},${baseline}`
      );
    })
    .join(" ");
}

/**
 * Construye el "d" de un <Path> que rellena de y=0 hasta la curva ondulada:
 * es el fondo oscuro del encabezado, con el borde inferior en forma de ola.
 */
export function buildHeaderCapPath(width: number, baseline: number, amplitude: number, periods: number): string {
  return `M0,0 L${width},0 L${width},${baseline} ${traceWave(width, baseline, amplitude, periods, "backward")} Z`;
}

/**
 * Construye el "d" de un <Path> que dibuja una cinta ondulada (ancho fijo,
 * grosor constante): la franja amarilla entre el fondo oscuro y el cuerpo
 * blanco. Su borde superior es la misma curva que el borde inferior del
 * fondo oscuro (buildHeaderCapPath), por lo que quedan contiguas sin huecos.
 */
export function buildWaveRibbonPath(
  width: number,
  baseline: number,
  thickness: number,
  amplitude: number,
  periods: number
): string {
  const bottomBaseline = baseline + thickness;
  return (
    `M0,${baseline} ${traceWave(width, baseline, amplitude, periods, "forward")}` +
    ` L${width},${bottomBaseline} ${traceWave(width, bottomBaseline, amplitude, periods, "backward")} Z`
  );
}

/**
 * Máscara blanca que cubre desde el borde inferior ondulado de una cinta
 * hasta el final de una zona (p. ej. el encabezado), para que esa zona
 * "corte" limpio a la altura de la ola sin dejar sobrante de color debajo.
 */
export function buildBelowRibbonMaskPath(
  width: number,
  zoneHeight: number,
  ribbonBottomBaseline: number,
  amplitude: number,
  periods: number
): string {
  return (
    `M0,${ribbonBottomBaseline} ${traceWave(width, ribbonBottomBaseline, amplitude, periods, "forward")}` +
    ` L${width},${zoneHeight} L0,${zoneHeight} Z`
  );
}

export const HEADER_CAP_PATH_D = buildHeaderCapPath(
  WAVE_VIEWBOX_WIDTH,
  WAVE_BASELINE,
  WAVE_AMPLITUDE,
  WAVE_PERIODS
);

export const WAVE_RIBBON_PATH_D = buildWaveRibbonPath(
  WAVE_VIEWBOX_WIDTH,
  WAVE_BASELINE,
  WAVE_THICKNESS,
  WAVE_AMPLITUDE,
  WAVE_PERIODS
);

// --- Divisor diagonal recto de paneles del encabezado (feature 007) ---

export const PANEL_VIEWBOX_WIDTH = 600;
export const PANEL_BASELINE_X = 288;
export const PANEL_DIAGONAL_SKEW = 34;

/**
 * Región clara del encabezado (panel izquierdo), con el borde derecho recto
 * pero en diagonal (no vertical): más ancho arriba, más angosto abajo.
 */
export function buildLeftPanelPath(height: number, bottomX: number, skew: number): string {
  const topX = bottomX + skew;
  return `M0,0 L${topX},0 L${bottomX},${height} L0,${height} Z`;
}

/**
 * Región oscura del encabezado (panel derecho). Comparte exactamente la
 * misma diagonal que `buildLeftPanelPath`, así los dos paneles quedan
 * contiguos sin huecos ni superposición.
 */
export function buildRightPanelPath(width: number, height: number, bottomX: number, skew: number): string {
  const topX = bottomX + skew;
  return `M${width},0 L${topX},0 L${bottomX},${height} L${width},${height} Z`;
}

/** El trazo del filo metálico del divisor reutiliza la misma diagonal, sin relleno. */
export function buildPanelDividerStrokePath(height: number, bottomX: number, skew: number): string {
  const topX = bottomX + skew;
  return `M${topX},0 L${bottomX},${height}`;
}
