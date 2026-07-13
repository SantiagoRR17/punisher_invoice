import { Document, Page, View, Text, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyCOP } from "@/lib/currency";
import type { Cotizacion } from "@/models/Cotizacion";

const HEADER_ZONE_HEIGHT = 112;
const WAVE_VIEWBOX_WIDTH = 600;
const WAVE_BASELINE = 90;
const WAVE_AMPLITUDE = 7;
const WAVE_THICKNESS = 9;
const WAVE_PERIODS = 3;

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
function buildHeaderCapPath(width: number, baseline: number, amplitude: number, periods: number): string {
  return `M0,0 L${width},0 L${width},${baseline} ${traceWave(width, baseline, amplitude, periods, "backward")} Z`;
}

/**
 * Construye el "d" de un <Path> que dibuja una cinta ondulada (ancho fijo,
 * grosor constante): la franja amarilla entre el fondo oscuro y el cuerpo
 * blanco. Su borde superior es la misma curva que el borde inferior del
 * fondo oscuro (buildHeaderCapPath), por lo que quedan contiguas sin huecos.
 */
function buildWaveRibbonPath(
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

const HEADER_CAP_PATH_D = buildHeaderCapPath(
  WAVE_VIEWBOX_WIDTH,
  WAVE_BASELINE,
  WAVE_AMPLITUDE,
  WAVE_PERIODS
);

const WAVE_RIBBON_PATH_D = buildWaveRibbonPath(
  WAVE_VIEWBOX_WIDTH,
  WAVE_BASELINE,
  WAVE_THICKNESS,
  WAVE_AMPLITUDE,
  WAVE_PERIODS
);

/**
 * Placeholder de marca: no existen todavía los archivos reales de logo,
 * firma e ícono de soldador en public/ (ver DOCS/003-formulario-cotizacion.md).
 * Reemplazar por Image de @react-pdf/renderer cuando estén disponibles.
 */
const EMPRESA = {
  nombre: "EL TALLER DEL SOLDADOR",
  tagline: "SOLUCIONES METÁLICAS CON CALIDAD, FUERZA Y COMPROMISO",
  direccion: "Calle 75 N° 78-56, Bogotá DC – Colombia",
  telefono: "322 200 3921",
  correo: "erickjulian.for@gmail.com",
};

const NOTAS = [
  "Cualquier trabajo, modificación o servicio adicional no contemplado dentro de los costos descritos en esta cotización será cobrado como un valor adicional.",
  "Abono del 50% al inicio del proyecto y el 50% al finalizar la entrega total.",
  "Plazo de entrega 20 días hábiles a partir del abono del 50%.",
];

const COLORS = {
  dark: "#1b2a31",
  accent: "#215866",
  yellow: "#f2b705",
  textMuted: "#4b5b62",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.dark,
    backgroundColor: "#ffffff",
  },
  headerZone: {
    height: HEADER_ZONE_HEIGHT,
    position: "relative",
  },
  headerSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: HEADER_ZONE_HEIGHT,
  },
  headerContent: {
    color: "#ffffff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyBlock: { flexDirection: "row", alignItems: "center" },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoPlaceholderText: { color: COLORS.yellow, fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  companyTagline: { fontSize: 7, color: COLORS.yellow, marginTop: 2, maxWidth: 180 },
  contactBlock: { alignItems: "flex-end" },
  contactLine: { fontSize: 8, marginBottom: 3 },
  body: { padding: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  clienteBlock: { maxWidth: 220 },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    marginBottom: 4,
  },
  clienteText: { fontSize: 9, marginBottom: 2 },
  clienteNombre: { fontFamily: "Helvetica-Bold" },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "right" },
  intro: { fontSize: 8, maxWidth: 220, textAlign: "right", color: COLORS.textMuted, marginTop: 6 },
  table: { marginTop: 8, borderWidth: 1, borderColor: COLORS.dark },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.dark },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 6,
  },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dddddd" },
  tableCell: { fontSize: 8, padding: 6 },
  colItem: { width: "8%" },
  colDescripcion: { width: "42%" },
  colCantidad: { width: "16%", textAlign: "center" },
  colValorUnitario: { width: "17%", textAlign: "right" },
  colValorTotal: { width: "17%", textAlign: "right" },
  totalRow: { flexDirection: "row", backgroundColor: COLORS.dark },
  totalLabel: {
    width: "83%",
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  totalValue: {
    width: "17%",
    backgroundColor: COLORS.yellow,
    color: COLORS.dark,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  notes: { marginTop: 16 },
  noteLine: { fontSize: 7, marginBottom: 4, color: COLORS.textMuted },
  noteLabel: { fontFamily: "Helvetica-Bold", color: COLORS.dark },
  signatureBlock: { marginTop: 24, alignItems: "flex-end" },
  signaturePlaceholder: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark,
    paddingTop: 4,
    textAlign: "center",
  },
  signatureText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: {
    marginTop: "auto",
    backgroundColor: COLORS.dark,
    color: COLORS.yellow,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    padding: 8,
  },
});

function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(fecha)
    .toUpperCase();
}

interface CotizacionPdfProps {
  cotizacion: Pick<Cotizacion, "cliente" | "items" | "fecha" | "total">;
}

export default function CotizacionPdf({ cotizacion }: CotizacionPdfProps) {
  const { cliente, items, fecha, total } = cotizacion;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerZone}>
          <Svg
            style={styles.headerSvg}
            viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} ${HEADER_ZONE_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <Path d={HEADER_CAP_PATH_D} fill={COLORS.dark} />
            <Path d={WAVE_RIBBON_PATH_D} fill={COLORS.yellow} />
          </Svg>

          <View style={styles.headerContent}>
            <View style={styles.companyBlock}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>TF</Text>
              </View>
              <View>
                <Text style={styles.companyName}>{EMPRESA.nombre}</Text>
                <Text style={styles.companyTagline}>{EMPRESA.tagline}</Text>
              </View>
            </View>
            <View style={styles.contactBlock}>
              <Text style={styles.contactLine}>{EMPRESA.direccion}</Text>
              <Text style={styles.contactLine}>{EMPRESA.telefono}</Text>
              <Text style={styles.contactLine}>{EMPRESA.correo}</Text>
              <Text style={styles.contactLine}>{formatFecha(fecha)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.clienteBlock}>
              <Text style={styles.sectionLabel}>DATOS DEL CLIENTE</Text>
              <Text style={styles.clienteText}>{cliente.tratamiento}:</Text>
              <Text style={[styles.clienteText, styles.clienteNombre]}>{cliente.nombre}</Text>
              <Text style={styles.clienteText}>CC {cliente.cedula}</Text>
              <Text style={styles.clienteText}>{cliente.direccion}</Text>
              <Text style={styles.clienteText}>Barrio {cliente.barrio}</Text>
            </View>
            <View>
              <Text style={styles.title}>COTIZACIÓN Y ORDEN DE TRABAJO</Text>
              <Text style={styles.intro}>
                De manera atenta y con base en su requerimiento, generamos la correspondiente
                orden de trabajo con las siguientes características:
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colItem]}>ÍTEM</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescripcion]}>DESCRIPCIÓN</Text>
              <Text style={[styles.tableHeaderCell, styles.colCantidad]}>CANTIDAD</Text>
              <Text style={[styles.tableHeaderCell, styles.colValorUnitario]}>
                VALOR UNITARIO
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colValorTotal]}>VALOR TOTAL</Text>
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colItem]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.colDescripcion]}>{item.descripcion}</Text>
                <Text style={[styles.tableCell, styles.colCantidad]}>{item.cantidad}</Text>
                <Text style={[styles.tableCell, styles.colValorUnitario]}>
                  {formatCurrencyCOP(item.valorUnitario)}
                </Text>
                <Text style={[styles.tableCell, styles.colValorTotal]}>
                  {formatCurrencyCOP(item.cantidad * item.valorUnitario)}
                </Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrencyCOP(total)}</Text>
            </View>
          </View>

          <View style={styles.notes}>
            <Text style={styles.noteLine}>
              <Text style={styles.noteLabel}>NOTA 1: </Text>
              {NOTAS[0]}
            </Text>
            <Text style={styles.noteLine}>
              <Text style={styles.noteLabel}>NOTA 2: </Text>
              {NOTAS[1]}
            </Text>
            <Text style={styles.noteLine}>
              <Text style={styles.noteLabel}>NOTA 3: </Text>
              {NOTAS[2]}
            </Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signaturePlaceholder}>
              <Text style={styles.signatureText}>{EMPRESA.nombre}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{EMPRESA.tagline}</Text>
      </Page>
    </Document>
  );
}
