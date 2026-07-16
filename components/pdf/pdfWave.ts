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

// --- Onda vertical: divisor de paneles del encabezado (feature 007) ---

export const PANEL_VIEWBOX_WIDTH = 600;
export const PANEL_BASELINE_X = 360;
export const PANEL_WAVE_AMPLITUDE = 18;
export const PANEL_WAVE_PERIODS = 1;

/**
 * Igual que `traceWave` pero transpuesta: oscila en X a lo largo de Y, para
 * trazar un divisor vertical (lado a lado) en vez de un borde horizontal.
 */
function tracePanelWave(height: number, baselineX: number, amplitude: number, periods: number): string {
  const period = height / periods;
  const half = period / 2;

  return [...Array(periods).keys()]
    .map((i) => {
      const y0 = i * period;
      return (
        `C${baselineX - amplitude},${y0 + half / 3} ${baselineX - amplitude},${y0 + (half * 2) / 3} ${baselineX},${y0 + half}` +
        ` C${baselineX + amplitude},${y0 + half + half / 3} ${baselineX + amplitude},${y0 + half + (half * 2) / 3} ${baselineX},${y0 + period}`
      );
    })
    .join(" ");
}

/**
 * Región oscura del encabezado (panel izquierdo), con el borde derecho
 * ondulado en vez de recto.
 */
export function buildLeftPanelPath(
  height: number,
  baselineX: number,
  amplitude: number,
  periods: number
): string {
  return `M0,0 L${baselineX},0 ${tracePanelWave(height, baselineX, amplitude, periods)} L0,${height} Z`;
}

/**
 * Región clara del encabezado (panel derecho). Comparte exactamente la misma
 * curva que `buildLeftPanelPath`, así los dos paneles quedan contiguos sin
 * huecos ni superposición.
 */
export function buildRightPanelPath(
  width: number,
  height: number,
  baselineX: number,
  amplitude: number,
  periods: number
): string {
  return `M${width},0 L${baselineX},0 ${tracePanelWave(height, baselineX, amplitude, periods)} L${width},${height} Z`;
}

/** El trazo del filo metálico del divisor reutiliza la misma curva, sin relleno. */
export function buildPanelDividerStrokePath(
  height: number,
  baselineX: number,
  amplitude: number,
  periods: number
): string {
  return `M${baselineX},0 ${tracePanelWave(height, baselineX, amplitude, periods)}`;
}
