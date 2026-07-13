import { Document, Page, View, Text, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyCOP } from "@/lib/currency";
import type { Cotizacion } from "@/models/Cotizacion";

const HEADER_HEIGHT = 112;
const WAVE_VIEWBOX_WIDTH = 600;
const WAVE_VIEWBOX_HEIGHT = 30;
const WAVE_AMPLITUDE = 7;
const WAVE_THICKNESS = 9;
const WAVE_PERIODS = 3;

/**
 * Construye el "d" de un <Path> que dibuja una cinta ondulada (ancho fijo,
 * grosor constante) que simula el efecto de olas del template: se usa como
 * divisor entre el encabezado oscuro y el cuerpo blanco del PDF.
 */
function buildWavePath(width: number, thickness: number, amplitude: number, periods: number): string {
  const period = width / periods;
  const half = period / 2;
  const topBaseline = amplitude + 1;

  const top: string[] = [`M0,${topBaseline}`];
  for (let i = 0; i < periods; i++) {
    const x0 = i * period;
    top.push(
      `C${x0 + half / 3},${topBaseline - amplitude} ${x0 + (half * 2) / 3},${topBaseline - amplitude} ${x0 + half},${topBaseline}`
    );
    top.push(
      `C${x0 + half + half / 3},${topBaseline + amplitude} ${x0 + half + (half * 2) / 3},${topBaseline + amplitude} ${x0 + period},${topBaseline}`
    );
  }

  const bottomBaseline = topBaseline + thickness;
  const bottom: string[] = [`L${width},${bottomBaseline}`];
  for (let i = periods - 1; i >= 0; i--) {
    const x0 = i * period;
    bottom.push(
      `C${x0 + half + (half * 2) / 3},${bottomBaseline + amplitude} ${x0 + half + half / 3},${bottomBaseline + amplitude} ${x0 + half},${bottomBaseline}`
    );
    bottom.push(
      `C${x0 + (half * 2) / 3},${bottomBaseline - amplitude} ${x0 + half / 3},${bottomBaseline - amplitude} ${x0},${bottomBaseline}`
    );
  }

  return `${top.join(" ")} ${bottom.join(" ")} Z`;
}

const WAVE_PATH_D = buildWavePath(
  WAVE_VIEWBOX_WIDTH,
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
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.dark,
    color: "#ffffff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  wave: {
    position: "absolute",
    top: HEADER_HEIGHT - WAVE_VIEWBOX_HEIGHT / 2,
    left: 0,
    width: "100%",
    height: WAVE_VIEWBOX_HEIGHT,
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
        <View style={styles.header}>
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

        <View style={styles.wave}>
          <Svg
            width="100%"
            height={WAVE_VIEWBOX_HEIGHT}
            viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} ${WAVE_VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <Path d={WAVE_PATH_D} fill={COLORS.yellow} />
          </Svg>
        </View>
      </Page>
    </Document>
  );
}
