import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyCOP } from "@/lib/currency";
import type { Cotizacion } from "@/models/Cotizacion";
import {
  COLORS,
  TABLE_HEADER,
  TABLE_HIGHLIGHT,
  EMPRESA,
  PdfHeader,
  PdfServiceBoxes,
  PdfFooter,
  formatFecha,
  tableRowBackground,
} from "./PdfBrand";

const NOTAS = [
  "Cualquier trabajo, modificación o servicio adicional no contemplado dentro de los costos descritos en esta cotización será cobrado como un valor adicional.",
  "Abono del 50% al inicio del proyecto y el 50% al finalizar la entrega total.",
  "Plazo de entrega 20 días hábiles a partir del abono del 50%.",
];

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.dark,
    backgroundColor: "#ffffff",
  },
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
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  metaLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.accent },
  metaValue: { fontSize: 8 },
  intro: { fontSize: 8, maxWidth: 220, textAlign: "right", color: COLORS.textMuted, marginTop: 6 },
  table: { marginTop: 8, borderWidth: 1, borderColor: COLORS.dark },
  tableHeaderRow: { flexDirection: "row", backgroundColor: TABLE_HEADER },
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
  totalRow: { flexDirection: "row", backgroundColor: TABLE_HIGHLIGHT },
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
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    padding: 6,
    textAlign: "right",
  },
  notes: { marginTop: 16 },
  noteLine: { fontSize: 7, marginBottom: 4, color: COLORS.textMuted },
  noteLabel: { fontFamily: "Helvetica-Bold", color: COLORS.dark },
  signatureBlock: { marginTop: 24, alignItems: "flex-end" },
  thanksLine: { fontSize: 8, color: COLORS.textMuted, textAlign: "right" },
  thanksLineBold: { fontFamily: "Helvetica-Bold", color: COLORS.dark },
  signaturePlaceholder: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark,
    paddingTop: 4,
    textAlign: "center",
  },
  signatureText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  signatureTitular: { fontSize: 7, color: COLORS.textMuted, marginTop: 1 },
  signatureImage: { width: 160, height: 40, objectFit: "contain", marginTop: 6 },
});

interface CotizacionPdfProps {
  cotizacion: Pick<Cotizacion, "cliente" | "items" | "fecha" | "total">;
  firmaUrl?: string;
}

export default function CotizacionPdf({ cotizacion, firmaUrl }: CotizacionPdfProps) {
  const { cliente, items, fecha, total } = cotizacion;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.clienteBlock}>
              <Text style={styles.sectionLabel}>DATOS DEL CLIENTE</Text>
              <Text style={styles.clienteText}>{cliente.tratamiento}:</Text>
              <Text style={[styles.clienteText, styles.clienteNombre]}>{cliente.nombre}</Text>
              <Text style={styles.clienteText}>CC {cliente.cedula}</Text>
              <Text style={styles.clienteText}>{cliente.direccion}</Text>
              <Text style={styles.clienteText}>Cel. {cliente.celular}</Text>
            </View>
            <View>
              <Text style={styles.title}>COTIZACIÓN Y ORDEN DE TRABAJO</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>FECHA:</Text>
                <Text style={styles.metaValue}>{formatFecha(fecha)}</Text>
              </View>
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
              <View
                key={index}
                style={[styles.tableRow, { backgroundColor: tableRowBackground(index) }]}
              >
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
            <Text style={styles.thanksLine}>Agradecemos su confianza.</Text>
            <Text style={[styles.thanksLine, styles.thanksLineBold]}>
              ¡Estamos para construir juntos!
            </Text>
            {firmaUrl && <Image src={firmaUrl} style={styles.signatureImage} />}
            <View style={styles.signaturePlaceholder}>
              <Text style={styles.signatureText}>EL TALLER DEL SOLDADOR</Text>
              <Text style={styles.signatureTitular}>{EMPRESA.titular}</Text>
            </View>
          </View>
        </View>

        <PdfServiceBoxes />
        <PdfFooter />
      </Page>
    </Document>
  );
}
